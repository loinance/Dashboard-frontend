# Loinance — Backend API Requirements

**Status:** draft for implementation
**Owner:** Loinance Solutions Pvt Ltd
**Last updated:** 12 August 2026
**Consumers:** `dashboard-front` (public marketing site + internal leads dashboard)

---

## 1. Purpose and scope

The marketing site currently captures a loan enquiry in `useApplicationForm.ts` and
throws it away — submission is a `console.info` stub. This API replaces that stub.

It must do four things:

1. **Accept a lead** from the public site and store it durably in Postgres.
2. **Reject junk** — bot submissions and abusive IPs — before it reaches the team,
   so nobody wastes a callback on a fake number.
3. **Authenticate staff** so leads are visible only to Loinance.
4. **Serve the internal dashboard** — list, filter by loan type and date, and export to Excel.

### Out of scope for v1

Per-advisor lead assignment, call logging, WhatsApp/Telegram notifications, OTP
verification of the mobile number, and any partner-bank integration. Section 13
lists these as phased follow-ups. The schema in section 4 leaves room for them so
they don't force a migration later.

---

## 2. Technology

| Concern | Choice | Note |
|---|---|---|
| Runtime | Node.js 22 LTS + TypeScript | Same language as the frontend |
| Framework | Express 5 | Fastify is a fine substitute; nothing here depends on the choice |
| Database | PostgreSQL 16+ | Supabase (`ap-south-1`, Mumbai) or any managed Postgres in India |
| Migrations / access | Drizzle ORM | TypeScript-native migrations, no codegen step |
| Validation | Zod | One schema per endpoint, shared shapes with the frontend where useful |
| Password hashing | Argon2id | Not bcrypt, not SHA-anything |
| Sessions | JWT in an httpOnly cookie | See §6 |
| Excel export | ExcelJS (streaming writer) | See §9 |
| Logging | Pino, with PII redaction | See §11.6 |

**Data residency:** the database and any backups must stay in an Indian region.
Leads contain name, mobile, and income — personal data under the DPDP Act, and
partner-bank due diligence will ask where it lives.

---

## 3. Environments

| Variable | Example | Notes |
|---|---|---|
| `NODE_ENV` | `production` | |
| `PORT` | `8080` | |
| `DATABASE_URL` | `postgres://…` | SSL required in production |
| `JWT_SECRET` | 32+ random bytes | Rotate invalidates all sessions |
| `COOKIE_DOMAIN` | `.loinance.com` | |
| `CORS_ORIGIN` | `https://www.loinance.com` | Comma-separated list; no wildcard |
| `TRUST_PROXY` | `1` | **Critical** — see §5.1 |
| `TURNSTILE_SECRET` | — | Cloudflare Turnstile server key |
| `RATE_LIMIT_IP_HOURLY` | `3` | |
| `RATE_LIMIT_IP_DAILY` | `10` | |
| `LEAD_DEDUPE_WINDOW_HOURS` | `24` | |

Secrets never appear in the repo, in the frontend bundle, or in log output.

---

## 4. Data model

```sql
-- ─────────────────────────────────────────── staff accounts
create table users (
  id            uuid primary key default gen_random_uuid(),
  email         citext not null unique,
  password_hash text not null,
  name          text not null,
  role          text not null default 'agent',   -- 'admin' | 'agent'
  is_active     boolean not null default true,
  last_login_at timestamptz,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────── the leads themselves
create table leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- submitted values (mirrors ApplicationValues in the frontend)
  full_name     text   not null,
  mobile        text   not null,          -- normalized: 10 digits, no +91, no spaces
  loan_type     text   not null,          -- personal|home|mortgage|car|business|credit-card
  amount        bigint not null,          -- rupees, integer
  income        bigint not null,          -- rupees per month, integer
  employment    text   not null,          -- salaried|self-employed|business-owner

  -- DPDP consent audit: prove what they agreed to, and when
  consent_at    timestamptz not null,
  consent_text  text not null,            -- exact wording rendered at submit time
  consent_version text not null default 'v1',

  -- request context, used for the anti-junk rules in §5
  ip            inet,
  user_agent    text,
  referer       text,
  page_url      text,
  utm           jsonb,                    -- {source, medium, campaign, term, content}
  source        text default 'hero',      -- 'hero' | 'contact-cta' | 'manual'

  -- junk detection outcome (§5.4) — soft signals, not hard rejections
  risk_flags    text[] not null default '{}',
  is_suspect    boolean not null default false,

  -- workflow
  status        text not null default 'new',
      -- new|contacted|qualified|sent_to_bank|disbursed|rejected|junk
  notes         text,
  owner_id      uuid references users(id),
  first_call_at timestamptz
);

create index leads_created_at_idx  on leads (created_at desc);
create index leads_loan_type_idx   on leads (loan_type);
create index leads_status_idx      on leads (status);
create index leads_mobile_idx      on leads (mobile);
create index leads_ip_created_idx  on leads (ip, created_at desc);
create index leads_suspect_idx     on leads (is_suspect) where is_suspect = true;

-- ─────────────────────────────────────────── abuse controls
create table blocked_ips (
  ip          inet primary key,
  reason      text not null,
  blocked_by  uuid references users(id),
  created_at  timestamptz not null default now(),
  expires_at  timestamptz                  -- null = permanent
);

create table submission_attempts (
  id         bigserial primary key,
  ip         inet not null,
  mobile     text,
  at         timestamptz not null default now(),
  outcome    text not null                 -- accepted|rate_limited|blocked|invalid|bot
);

create index submission_attempts_ip_at_idx on submission_attempts (ip, at desc);

-- ─────────────────────────────────────────── who changed what
create table audit_log (
  id         bigserial primary key,
  at         timestamptz not null default now(),
  user_id    uuid references users(id),
  action     text not null,                -- login|lead_updated|lead_exported|ip_blocked
  entity_id  uuid,
  payload    jsonb,
  ip         inet
);
```

**Notes on the shape**

- `submission_attempts` is what makes IP rate limiting survive a restart and stay
  correct across multiple instances. Don't hold counters in process memory.
- `risk_flags` is an array, not a boolean, so the dashboard can show *why* a lead
  looks suspect and ops can overrule it.
- `audit_log` records every export. Bulk PII leaving the system should be traceable
  to a person under DPDP.
- Prune `submission_attempts` older than 30 days on a nightly job.

---

## 5. Anti-junk requirements

The stated goal is no fake calls. The design principle: **filter bots hard, flag
suspicious humans softly.** A false rejection costs a real customer; a false flag
costs a second of an advisor's attention.

### 5.1 IP capture (must be correct first)

Behind a proxy or CDN, `req.ip` returns the proxy's address unless `trust proxy`
is configured. Every IP rule below is worthless if this is wrong.

- Set `app.set('trust proxy', <exact number of proxy hops>)`. Never `true`, which
  lets a caller forge `X-Forwarded-For` and defeat every limit here.
- On Cloudflare, prefer the `CF-Connecting-IP` header.
- Store the resolved address in `leads.ip` and on every row in `submission_attempts`,
  including rejected ones — the rejections are the interesting data.

### 5.2 Hard rejections (request never becomes a lead)

| Rule | Response |
|---|---|
| IP present in `blocked_ips` (unexpired) | `403 IP_BLOCKED` |
| More than `RATE_LIMIT_IP_HOURLY` accepted leads from this IP in 1 hour | `429 RATE_LIMITED` |
| More than `RATE_LIMIT_IP_DAILY` in 24 hours | `429 RATE_LIMITED` |
| Honeypot field non-empty | `202` with a success-shaped body, nothing stored |
| Submitted less than 3 seconds after form render | `202` with a success-shaped body, nothing stored |
| Cloudflare Turnstile token missing or invalid | `400 CAPTCHA_FAILED` |
| `Origin` / `Referer` not in `CORS_ORIGIN` | `403 BAD_ORIGIN` |
| Field validation failure (§7) | `422 VALIDATION_ERROR` |

Bot rejections return `202` and a normal-looking success payload deliberately. A
scraper that gets a clear error message tunes itself around the check; one that
appears to succeed usually doesn't.

Every attempt — accepted or not — writes one `submission_attempts` row.

### 5.3 Duplicate handling

A repeat submission of the same mobile within `LEAD_DEDUPE_WINDOW_HOURS` **updates
the existing lead** and appends nothing new to the queue. Returns `200` with the
original lead id. People resubmit because they weren't sure it worked — that's not
abuse, and it must not produce two callbacks.

### 5.4 Soft flags (lead is stored, `is_suspect = true`)

Written to `risk_flags` and surfaced in the dashboard as a badge:

| Flag | Trigger |
|---|---|
| `repeated_digits` | Mobile is `9999999999`, `1234567890`, and similar patterns |
| `datacenter_ip` | IP belongs to a hosting/VPN ASN |
| `foreign_ip` | Geolocation outside India — flag only, never block; NRIs and VPN users are real customers |
| `income_implausible` | Income > ₹50L/month, or amount > 100× monthly income |
| `burst_ip` | 2+ leads from this IP in the last hour (under the hard limit) |
| `no_referer` | Direct POST with no `Referer` — typical of a script |

Suspect leads are excluded from the default dashboard view but reachable via a
filter. They are never silently deleted.

### 5.5 Deliberately not in v1

**OTP verification of the mobile.** It's the only thing that truly stops a real
human entering a fake number, but it adds friction at the highest-drop-off moment
in the form. Ship without it, measure the connect rate for a month, add it only if
the junk rate justifies the lost leads. The schema has room (`mobile_verified`) —
add the column when you need it.

---

## 6. Authentication

**No public signup.** Accounts are created by an admin or seeded directly. The
login form is the only auth surface on the public site.

- Password hashed with Argon2id.
- On success, issue a JWT set as an httpOnly cookie:
  `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800` (8 hours).
- The token is **never** returned in the response body and never touches
  `localStorage` — that's the difference between a stolen session and a safe one
  when an XSS bug eventually happens.
- Login is rate limited to 5 attempts per IP per 15 minutes and 5 per email per 15
  minutes. Failures return an identical message and take a constant amount of time
  whether or not the email exists.
- All `/api/admin/*` routes require a valid cookie; anything else returns `401`.
- Every login and every failed attempt writes to `audit_log`.

---

## 7. Field validation

Applied server-side on `POST /api/leads`. The frontend should mirror these for UX,
but the server is the authority — client checks are bypassed with one `curl`.

| Field | Rule |
|---|---|
| `fullName` | Required, trimmed, 2–80 chars, letters/spaces/`.`/`'`/`-` only |
| `mobile` | Required, exactly 10 digits after stripping `+91`/`0`/spaces/dashes, must match `^[6-9]\d{9}$` |
| `loanType` | Required, one of `personal`, `home`, `mortgage`, `car`, `business`, `credit-card` |
| `amount` | Required integer, ₹10,000 – ₹10,00,00,000 |
| `income` | Required integer, ₹5,000 – ₹1,00,00,000 |
| `employment` | Required, one of `salaried`, `self-employed`, `business-owner` |
| `consent` | Must be exactly `true`. Absent or false → `422`, no storage. |
| `consentText` | Required, the exact string rendered to the user |
| `utm`, `pageUrl`, `referer` | Optional, each capped at 500 chars |

The mobile is normalized to 10 bare digits **before** the dedupe check, so
`+91 98444 93082` and `9844493082` collide correctly.

---

## 8. Endpoints

Base path `/api`. All responses are JSON except the Excel export.

### 8.1 Public

#### `POST /api/leads`

Creates a lead. Unauthenticated, rate limited, Turnstile-protected.

```jsonc
// Request
{
  "fullName": "Ramesh Kumar",
  "mobile": "9844493082",
  "loanType": "personal",
  "amount": 600000,
  "income": 85000,
  "employment": "salaried",
  "consent": true,
  "consentText": "I agree that Loinance may share these details…",
  "turnstileToken": "0.abc…",
  "website": "",              // honeypot — must be empty
  "renderedAt": 1754990000000, // form render timestamp, for the §5.2 time check
  "pageUrl": "https://www.loinance.com/#apply",
  "utm": { "source": "google", "medium": "cpc", "campaign": "personal-loan-blr" }
}
```

```jsonc
// 201 Created
{ "ok": true, "id": "8f1c…", "message": "We'll call you within the hour." }
// 200 OK — duplicate within the dedupe window, existing lead updated
{ "ok": true, "id": "8f1c…", "duplicate": true }
```

Errors: `400 CAPTCHA_FAILED`, `403 IP_BLOCKED`, `403 BAD_ORIGIN`,
`422 VALIDATION_ERROR`, `429 RATE_LIMITED`.

**The response must not wait on notifications.** Store the lead, commit, return —
then fire any alert. A failing Telegram or WhatsApp call must never turn a captured
lead into an error for the customer.

#### `GET /api/health`

`200 {"ok": true, "db": "up"}`. No auth, no PII.

### 8.2 Auth

| Method | Path | Body | Returns |
|---|---|---|---|
| `POST` | `/api/auth/login` | `{email, password}` | `200 {user:{id,name,email,role}}` + cookie · `401 INVALID_CREDENTIALS` · `429` |
| `POST` | `/api/auth/logout` | — | `204`, clears cookie |
| `GET` | `/api/auth/me` | — | `200 {user}` · `401` — used by the frontend on load to decide whether to show the dashboard |

### 8.3 Leads dashboard (authenticated)

#### `GET /api/admin/leads`

| Query param | Type | Default | Notes |
|---|---|---|---|
| `loanType` | csv | all | `personal,home` — matches any listed |
| `status` | csv | all | |
| `employment` | csv | all | |
| `from` | ISO date | — | Inclusive, **Asia/Kolkata**, start of day |
| `to` | ISO date | — | Inclusive, **Asia/Kolkata**, end of day |
| `q` | string | — | Case-insensitive match on name or mobile |
| `includeSuspect` | bool | `false` | §5.4 |
| `page` | int | `1` | |
| `pageSize` | int | `25` | Max 100 |
| `sort` | enum | `created_at:desc` | Also `created_at:asc`, `amount:desc` |

```jsonc
// 200
{
  "data": [ { "id": "…", "createdAt": "2026-08-12T09:14:22+05:30",
              "fullName": "Ramesh Kumar", "mobile": "9844493082",
              "loanType": "personal", "amount": 600000, "income": 85000,
              "employment": "salaried", "status": "new",
              "isSuspect": false, "riskFlags": [], "source": "hero" } ],
  "page": 1, "pageSize": 25, "total": 143, "totalPages": 6
}
```

**Date filtering is in IST, not UTC.** "Leads from 12 August" means midnight to
midnight Indian time; comparing raw UTC timestamps silently drops the 00:00–05:30
window into the previous day.

#### `GET /api/admin/leads/:id`

Full record including `ip`, `userAgent`, `referer`, `utm`, `consentText`,
`consentAt`, and `riskFlags`.

#### `PATCH /api/admin/leads/:id`

Body: any of `{status, notes, ownerId, firstCallAt}`. Writes an `audit_log` row.
Returns the updated lead.

#### `GET /api/admin/leads/stats`

Counts for the dashboard header — today, this week, this month, by status, by loan
type. Accepts the same date filters.

### 8.4 Abuse management (authenticated, `admin` role)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/admin/blocked-ips` | List |
| `POST` | `/api/admin/blocked-ips` | `{ip, reason, expiresAt?}` |
| `DELETE` | `/api/admin/blocked-ips/:ip` | Unblock |

---

## 9. Excel export

### `GET /api/admin/leads/export`

Authenticated. Accepts **every filter from §8.3** — the export must return exactly
the rows currently on screen, or the numbers won't reconcile and nobody will trust
the file.

- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition: attachment; filename="loinance-leads-2026-08-12.xlsx"`
- Streamed with the ExcelJS streaming writer — do not build the workbook in memory.
- Hard cap 10,000 rows per export; beyond that return `413` and ask for a narrower
  date range.
- Writes an `audit_log` entry: who exported, which filters, how many rows.

**Columns, in order:**

| # | Header | Format |
|---|---|---|
| 1 | Date | `dd-mm-yyyy hh:mm` IST |
| 2 | Name | Text |
| 3 | Mobile | **Text**, not number — a leading digit must never be eaten and it must not render as `9.84449E+09` |
| 4 | Loan Type | Display label (`Personal loan`, not `personal`) |
| 5 | Amount (₹) | Number, `#,##,##0` Indian grouping |
| 6 | Monthly Income (₹) | Number, `#,##,##0` |
| 7 | Employment | Display label |
| 8 | Status | Display label |
| 9 | Source | Text |
| 10 | Flags | Comma-joined `riskFlags` |
| 11 | Notes | Text |

Header row bold with a frozen top row and an autofilter. Column widths set so
nothing shows as `####`.

The export contains customer PII in a file that leaves your control. Restrict it to
authenticated staff, log every call, and don't add it to any public or shared route.

---

## 10. Error format

One shape everywhere, so the frontend has a single error path:

```jsonc
{
  "ok": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Enter a valid 10-digit mobile number.",
             "fields": { "mobile": "Must start with 6, 7, 8 or 9." } }
}
```

`message` is safe to show a user directly. Never leak SQL errors, stack traces, or
whether an email exists.

| HTTP | Codes |
|---|---|
| 400 | `BAD_REQUEST`, `CAPTCHA_FAILED` |
| 401 | `UNAUTHENTICATED`, `INVALID_CREDENTIALS`, `SESSION_EXPIRED` |
| 403 | `FORBIDDEN`, `IP_BLOCKED`, `BAD_ORIGIN` |
| 404 | `NOT_FOUND` |
| 413 | `EXPORT_TOO_LARGE` |
| 422 | `VALIDATION_ERROR` |
| 429 | `RATE_LIMITED` (include `Retry-After`) |
| 500 | `INTERNAL` |

---

## 11. Security and compliance

1. **HTTPS only.** HSTS enabled; plain HTTP redirects.
2. **CORS** restricted to `CORS_ORIGIN` with `credentials: true`. No wildcard —
   wildcards and cookie credentials are mutually exclusive anyway.
3. **Helmet** for standard security headers.
4. **CSRF:** `SameSite=Lax` covers the form-post case. If a cross-site admin
   surface is ever added, add a double-submit token.
5. **Parameterised queries only.** No string-built SQL anywhere.
6. **Logging:** Pino with `fullName`, `mobile`, `ip`, and `password` redacted from
   log output. Logs are not a lawful place to keep PII.
7. **DPDP:**
   - Store `consent_text` and `consent_at` verbatim on every lead.
   - Retention: purge or anonymise leads older than 24 months via a nightly job.
   - Support erasure on request — `DELETE /api/admin/leads/:id` (admin only, audit
     logged) covers it manually in v1.
   - Grievance officer details already published at `/grievance`.
8. **Backups:** nightly `pg_dump` to storage separate from the database host,
   7-day retention minimum, and a restore tested at least once before launch. An
   untested backup is a guess.

---

## 12. Frontend integration

Routes to add to `dashboard-front`:

| Route | Access | Notes |
|---|---|---|
| `/login` | Public | Email + password. On `200`, cookie is set; redirect to `/leads`. |
| `/leads` | Protected | Table, filters, export button. |
| `/leads/:id` | Protected | Detail drawer or page. |

- Every request uses `credentials: 'include'`. There is no token to attach —
  the cookie handles it.
- On load, call `GET /api/auth/me`. `401` → redirect to `/login`.
- A `401` from any call → clear local state, redirect to `/login`.
- Export triggers a normal browser navigation/download to the export URL with the
  current filters as query params, so the download uses the same cookie.
- `useApplicationForm.ts` changes: add the honeypot field, capture `renderedAt` on
  mount, fetch the Turnstile token, POST to `/api/leads`, and keep the WhatsApp
  link (`site.whatsapp`) as the visible fallback when the request fails.

---

## 13. Phasing

**Phase 1 — this document.** Lead capture, anti-junk, login, dashboard, filters, Excel.

**Phase 2.**
- Instant alerts on new leads: Telegram bot first (free, ~10 minutes), WhatsApp
  Cloud API once Meta business verification clears.
- Realtime dashboard updates via SSE or Supabase Realtime, replacing polling.
- SLA countdown against the "call within the hour" promise, with breach escalation.

**Phase 3.**
- OTP verification of the mobile, if and only if measured junk rates justify it.
- Per-advisor assignment and call logging (`lead_events` table).
- Partial-lead capture on mobile-field blur, to recover consent-checkbox drop-offs.

---

## 14. Acceptance criteria

- [ ] A valid submission from the live site appears in `leads` within 2 seconds.
- [ ] Four rapid submissions from one IP: three stored, the fourth returns `429`.
- [ ] A submission with the honeypot filled returns success and stores nothing.
- [ ] The same mobile submitted twice in an hour produces exactly one lead.
- [ ] `consent: false` is rejected with `422` and nothing is stored.
- [ ] A forged `X-Forwarded-For` header does not bypass the IP rate limit.
- [ ] Unauthenticated `GET /api/admin/leads` returns `401`.
- [ ] Filtering by loan type and a date range returns the same row count as the
      export produced with those filters.
- [ ] Mobile numbers in the exported `.xlsx` open as text, with all 10 digits.
- [ ] The JWT cookie is `HttpOnly` and unreadable from `document.cookie`.
- [ ] A `pg_dump` backup has been restored into a scratch database successfully.
