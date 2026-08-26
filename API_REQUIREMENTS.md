# Loinance — Backend API Requirements

**Status:** implemented — lead capture, auth, dashboard API and Excel export are built and running
**Owner:** Loinance Solutions Pvt Ltd
**Last updated:** 25 August 2026
**Consumers:** `dashboard-front` (public marketing site + internal leads dashboard)

> **Scope change, 25 August 2026 — rate limiting removed.** The backend keeps
> exactly two tables, `leads` and `users`. `submission_attempts`, `blocked_ips`
> and `audit_log` were dropped (`drizzle/0001_drop_abuse_tables.sql`), and with
> them the IP rate limit on `POST /api/leads`, the login brute-force throttle and
> the audit trail. This was a deliberate decision to keep the schema minimal.
> Sections below are written to match the code as it now stands; where a control
> was removed, it is called out rather than quietly deleted.

---

## 1. Purpose and scope test

The marketing site captures a loan enquiry in `useApplicationForm.ts`, which now
POSTs to `/api/leads`. This API is what receives it.

It does four things:

1. **Accept a lead** from the public site and store it durably in Postgres.
2. **Reject obvious bots** before they reach the team, so nobody wastes a callback
   on a fake number. Note the narrowed scope: with rate limiting removed, this is
   now the honeypot, the timing trap, the origin check and Turnstile — nothing
   that counts requests over time.
3. **Authenticate staff** so leads are visible only to Loinance.
4. **Serve the internal dashboard** — list, filter by loan type and date, and export to Excel.

### Out of scope for v1

Per-advisor lead assignment, call logging, WhatsApp/Telegram notifications, OTP
verification of the mobile number, and any partner-bank integration. Section 13
lists these as phased follow-ups. The schema in section 4 leaves room for them so
they don't force a migration later.

---

## 2. Technology

| Concern             | Choice                      | Note                                                                  |
| ------------------- | --------------------------- | --------------------------------------------------------------------- |
| Runtime             | Node.js 22 LTS + TypeScript | Same language as the frontend                                         |
| Framework           | Express 5                   | Fastify is a fine substitute; nothing here depends on the choice      |
| Database            | PostgreSQL 16+              | Supabase (`ap-south-1`, Mumbai) or any managed Postgres in India      |
| Migrations / access | Drizzle ORM                 | TypeScript-native migrations, no codegen step                         |
| Validation          | Zod                         | One schema per endpoint, shared shapes with the frontend where useful |
| Password hashing    | Argon2id                    | Not bcrypt, not SHA-anything                                          |
| Sessions            | JWT in an httpOnly cookie   | See §6                                                                |
| Excel export        | ExcelJS (streaming writer)  | See §9                                                                |
| Logging             | Pino, with PII redaction    | See §11.6                                                             |

**Data residency:** the database and any backups must stay in an Indian region.
Leads contain name, mobile, and income — personal data under the DPDP Act, and
partner-bank due diligence will ask where it lives.

---

## 3. Environments

| Variable                   | Example                    | Notes                                                                    |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `NODE_ENV`                 | `production`               |                                                                          |
| `PORT`                     | `8080`                     |                                                                          |
| `DATABASE_URL`             | `postgres://…`             | SSL required in production                                               |
| `JWT_SECRET`               | 32+ random bytes           | Rotate invalidates all sessions                                          |
| `COOKIE_DOMAIN`            | `.loinance.com`            |                                                                          |
| `CORS_ORIGIN`              | `https://www.loinance.com` | Comma-separated list; no wildcard                                        |
| `TRUST_PROXY`              | `1`                        | **Critical** — see §5.1                                                  |
| `TURNSTILE_SECRET`         | —                          | Cloudflare Turnstile server key; required when `NODE_ENV=production`     |
| `LEAD_DEDUPE_WINDOW_HOURS` | `24`                       |                                                                          |
| `BOT_MIN_FORM_SECONDS`     | `3`                        | Minimum seconds between form render and submit (§5.2)                    |
| `SESSION_HOURS`            | `8`                        |                                                                          |
| `EXPORT_MAX_ROWS`          | `10000`                    |                                                                          |
| `RUN_NIGHTLY_JOBS`         | `false`                    | Enable on exactly one instance, or drive `npm run job:nightly` from cron |
| `LEAD_RETENTION_MONTHS`    | `24`                       |                                                                          |

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

```

**Notes on the shape**

- These two tables are the whole schema. `blocked_ips`, `submission_attempts` and
  `audit_log` were part of the original design and have been dropped — see the
  scope-change note at the top.
- `risk_flags` is an array, not a boolean, so the dashboard can show _why_ a lead
  looks suspect and ops can overrule it.
- `leads_ip_created_idx` now serves the `burst_ip` flag (§5.4), which counts recent
  leads from the same IP directly out of this table.
- **No audit table.** Exports, edits and deletions are written to the application
  log (Pino) instead. That is weaker than the original design: bulk PII leaving the
  system is no longer queryable, only greppable, and log retention is not a
  DPDP-grade audit trail.

---

## 5. Anti-junk requirements

The stated goal is no fake calls. The design principle: **filter bots hard, flag
suspicious humans softly.** A false rejection costs a real customer; a false flag
costs a second of an advisor's attention.

**What is actually enforced.** Four checks stand between the public internet and
the `leads` table: the `Origin`/`Referer` check, the honeypot, the time-to-submit
trap, and Turnstile. The first three stop naive bots and nothing else — anyone
scripting directly against the API sets a correct `Origin`, leaves the honeypot
empty and waits three seconds. **Turnstile is therefore the only meaningful
protection on this endpoint**, and it must be configured before launch.

### 5.1 IP capture (must be correct first)

Behind a proxy or CDN, `req.ip` returns the proxy's address unless `trust proxy`
is configured. Every IP rule below is worthless if this is wrong.

- Set `app.set('trust proxy', <exact number of proxy hops>)`. Never `true`, which
  lets a caller forge `X-Forwarded-For`.
- On Cloudflare, prefer the `CF-Connecting-IP` header.
- Store the resolved address in `leads.ip`. Rejected submissions are no longer
  recorded anywhere — the attempt ledger is gone, so a rejection leaves no trace
  beyond a log line.

### 5.2 Hard rejections (request never becomes a lead)

Checks run in this order, cheapest first, so an invalid or bot submission never
costs a query it doesn't have to:

| Rule                                                         | Response                                         |
| ------------------------------------------------------------ | ------------------------------------------------ |
| `Origin` / `Referer` not in `CORS_ORIGIN`                    | `403 BAD_ORIGIN`                                 |
| Honeypot field non-empty                                     | `202` with a success-shaped body, nothing stored |
| Submitted less than `BOT_MIN_FORM_SECONDS` after form render | `202` with a success-shaped body, nothing stored |
| Cloudflare Turnstile token missing or invalid                | `400 CAPTCHA_FAILED`                             |
| Field validation failure (§7)                                | `422 VALIDATION_ERROR`                           |

Bot rejections return `202` and a normal-looking success payload deliberately. A
scraper that gets a clear error message tunes itself around the check; one that
appears to succeed usually doesn't.

**Removed:** IP blocking (`403 IP_BLOCKED`) and per-IP rate limiting
(`429 RATE_LIMITED`). There is no limit on how many leads one IP may submit, and
nothing is recorded about rejected attempts. The `IP_BLOCKED` and `RATE_LIMITED`
codes remain in the error enum (§10) but are never raised on this endpoint.

### 5.3 Duplicate handling

A repeat submission of the same mobile within `LEAD_DEDUPE_WINDOW_HOURS` **updates
the existing lead** and appends nothing new to the queue. Returns `200` with the
original lead id. People resubmit because they weren't sure it worked — that's not
abuse, and it must not produce two callbacks.

### 5.4 Soft flags (lead is stored, `is_suspect = true`)

Written to `risk_flags` and surfaced in the dashboard as a badge:

| Flag                 | Trigger                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `repeated_digits`    | Mobile is `9999999999`, `1234567890`, and similar patterns                                                                                  |
| `datacenter_ip`      | IP belongs to a hosting/VPN ASN                                                                                                             |
| `foreign_ip`         | Geolocation outside India — flag only, never block; NRIs and VPN users are real customers                                                   |
| `income_implausible` | Income > ₹50L/month, or amount > 100× monthly income                                                                                        |
| `burst_ip`           | Another lead already stored from this IP in the last hour. Counted from `leads`; a flag only — there is no hard limit to sit under any more |
| `no_referer`         | Direct POST with no `Referer` — typical of a script                                                                                         |

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
- Failures return an identical message whether or not the email exists.
- All `/api/admin/*` routes require a valid cookie; anything else returns `401`.
- **No login rate limiting.** The throttle counted `login_failed` rows in
  `audit_log`; with that table gone, password guessing against `/api/auth/login` is
  unlimited. Argon2id's cost is the only thing slowing an attacker down. Compensate
  with a long, unique admin password, and reinstate a throttle before exposing the
  login to the open internet.

---

## 7. Field validation

Applied server-side on `POST /api/leads`. The frontend should mirror these for UX,
but the server is the authority — client checks are bypassed with one `curl`.

| Field                       | Rule                                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `fullName`                  | Required, trimmed, 2–80 chars, letters/spaces/`.`/`'`/`-` only                                 |
| `mobile`                    | Required, exactly 10 digits after stripping `+91`/`0`/spaces/dashes, must match `^[6-9]\d{9}$` |
| `loanType`                  | Required, one of `personal`, `home`, `mortgage`, `car`, `business`, `credit-card`              |
| `amount`                    | Required integer, ₹10,000 – ₹10,00,00,000                                                      |
| `income`                    | Required integer, ₹5,000 – ₹1,00,00,000                                                        |
| `employment`                | Required, one of `salaried`, `self-employed`, `business-owner`                                 |
| `consent`                   | Must be exactly `true`. Absent or false → `422`, no storage.                                   |
| `consentText`               | Required, the exact string rendered to the user                                                |
| `utm`, `pageUrl`, `referer` | Optional, each capped at 500 chars                                                             |

The mobile is normalized to 10 bare digits **before** the dedupe check, so
`+91 98444 93082` and `9844493082` collide correctly.

---

## 8. Endpoints

Base path `/api`. All responses are JSON except the Excel export.

### 8.1 Public

#### `POST /api/leads`

Creates a lead. Unauthenticated and Turnstile-protected. **Not** rate limited.

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
  "website": "", // honeypot — must be empty
  "renderedAt": 1754990000000, // form render timestamp, for the §5.2 time check
  "pageUrl": "https://www.loinance.com/#apply",
  "utm": {
    "source": "google",
    "medium": "cpc",
    "campaign": "personal-loan-blr",
  },
}
```

```jsonc
// 201 Created
{ "ok": true, "id": "8f1c…", "message": "We'll call you within the hour." }
// 200 OK — duplicate within the dedupe window, existing lead updated
{ "ok": true, "id": "8f1c…", "duplicate": true }
```

Errors: `400 CAPTCHA_FAILED`, `403 BAD_ORIGIN`, `422 VALIDATION_ERROR`.

**The response must not wait on notifications.** Store the lead, commit, return —
then fire any alert. A failing Telegram or WhatsApp call must never turn a captured
lead into an error for the customer.

#### `GET /api/health`

`200 {"ok": true, "db": "up"}`. No auth, no PII.

### 8.2 Auth

| Method | Path               | Body                | Returns                                                                                     |
| ------ | ------------------ | ------------------- | ------------------------------------------------------------------------------------------- |
| `POST` | `/api/auth/login`  | `{email, password}` | `200 {user:{id,name,email,role}}` + cookie · `401 INVALID_CREDENTIALS`                      |
| `POST` | `/api/auth/logout` | —                   | `204`, clears cookie                                                                        |
| `GET`  | `/api/auth/me`     | —                   | `200 {user}` · `401` — used by the frontend on load to decide whether to show the dashboard |

### 8.3 Leads dashboard (authenticated)

#### `GET /api/admin/leads`

| Query param      | Type     | Default           | Notes                                     |
| ---------------- | -------- | ----------------- | ----------------------------------------- |
| `loanType`       | csv      | all               | `personal,home` — matches any listed      |
| `status`         | csv      | all               |                                           |
| `employment`     | csv      | all               |                                           |
| `from`           | ISO date | —                 | Inclusive, **Asia/Kolkata**, start of day |
| `to`             | ISO date | —                 | Inclusive, **Asia/Kolkata**, end of day   |
| `q`              | string   | —                 | Case-insensitive match on name or mobile  |
| `includeSuspect` | bool     | `false`           | §5.4                                      |
| `page`           | int      | `1`               |                                           |
| `pageSize`       | int      | `25`              | Max 100                                   |
| `sort`           | enum     | `created_at:desc` | Also `created_at:asc`, `amount:desc`      |
| `view`           | enum     | `summary`         | `full` returns every column — see below   |

This is **the** endpoint for reading leads in bulk. `view=full` exists so a caller
that wants complete records does not have to list the summary and then fetch each
`:id` separately.

```jsonc
// 200 — view=summary (default), 12 fields
{
  "data": [
    {
      "id": "…",
      "createdAt": "2026-08-12T03:44:22.000Z",
      "fullName": "Ramesh Kumar",
      "mobile": "9844493082",
      "loanType": "personal",
      "amount": 600000,
      "income": 85000,
      "employment": "salaried",
      "status": "new",
      "isSuspect": false,
      "riskFlags": [],
      "source": "hero",
    },
  ],
  "page": 1,
  "pageSize": 25,
  "total": 143,
  "totalPages": 6,
}
```

`view=full` adds the remaining 12 columns to each row — `updatedAt`, the consent
audit (`consentAt`, `consentText`, `consentVersion`), the request context (`ip`,
`userAgent`, `referer`, `pageUrl`, `utm`) and the workflow fields (`notes`,
`ownerId`, `firstCallAt`). The envelope is unchanged.

```
GET /api/admin/leads?from=2026-08-01&to=2026-08-25&view=full&includeSuspect=1
```

Three things `view=full` deliberately does **not** change:

- **Suspect leads are still excluded** unless `includeSuspect=1` (§5.4).
- **The result is still paginated**, max 100 per page. Read `total` / `totalPages`
  and walk `page` to drain it. For a genuine bulk dump use the Excel export (§9),
  which streams and does not hold the result set in memory.
- **Auth is still required.** `view=full` returns `consentText`, `ip` and
  `userAgent` for every row; it is logged like the export.

Columns are listed explicitly in `repository.ts` rather than selected with a bare
`select()`, so adding a column to `leads` is a deliberate decision to expose it.

**Date filtering is in IST, not UTC.** "Leads from 12 August" means midnight to
midnight Indian time; comparing raw UTC timestamps silently drops the 00:00–05:30
window into the previous day. `from` and `to` are both inclusive: `from=2026-08-18&to=2026-08-18`
returns that single IST day. Timestamps go out as UTC ISO 8601 (`…Z`) — convert at
the display layer.

#### `GET /api/admin/leads/:id`

Full record for one lead. Same field set as `view=full` above; use this when you
have an id, and `view=full` when you are working from a filter.

#### `PATCH /api/admin/leads/:id`

Body: any of `{status, notes, ownerId, firstCallAt}`. Writes a Pino log line (§4).
Returns the updated lead.

#### `GET /api/admin/leads/stats`

Counts for the dashboard header — today, this week, this month, by status, by loan
type. Accepts the same date filters.

### 8.4 Abuse management — removed

The `/api/admin/blocked-ips` endpoints (list, create, delete) were removed along
with the `blocked_ips` table. The routes now return `404`. There is no way to block
an abusive IP through the API; do it at the CDN or reverse proxy instead.

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
- Writes a Pino log line: who exported, which filters, how many rows. This
  replaced the `audit_log` entry and is not queryable — see §4.

**Columns, in order:**

| #   | Header             | Format                                                                                             |
| --- | ------------------ | -------------------------------------------------------------------------------------------------- |
| 1   | Date               | `dd-mm-yyyy hh:mm` IST                                                                             |
| 2   | Name               | Text                                                                                               |
| 3   | Mobile             | **Text**, not number — a leading digit must never be eaten and it must not render as `9.84449E+09` |
| 4   | Loan Type          | Display label (`Personal loan`, not `personal`)                                                    |
| 5   | Amount (₹)         | Number, `#,##,##0` Indian grouping                                                                 |
| 6   | Monthly Income (₹) | Number, `#,##,##0`                                                                                 |
| 7   | Employment         | Display label                                                                                      |
| 8   | Status             | Display label                                                                                      |
| 9   | Source             | Text                                                                                               |
| 10  | Flags              | Comma-joined `riskFlags`                                                                           |
| 11  | Notes              | Text                                                                                               |

Header row bold with a frozen top row and an autofilter. Column widths set so
nothing shows as `####`.

The export contains customer PII in a file that leaves your control. Restrict it to
authenticated staff and don't add it to any public or shared route. Every call is
logged, but only to the application log — if you need a durable, queryable record
of who exported what, the `audit_log` table has to come back.

---

## 10. Error format

One shape everywhere, so the frontend has a single error path:

```jsonc
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Enter a valid 10-digit mobile number.",
    "fields": { "mobile": "Must start with 6, 7, 8 or 9." },
  },
}
```

`message` is safe to show a user directly. Never leak SQL errors, stack traces, or
whether an email exists.

| HTTP | Codes                                                       |
| ---- | ----------------------------------------------------------- |
| 400  | `BAD_REQUEST`, `CAPTCHA_FAILED`                             |
| 401  | `UNAUTHENTICATED`, `INVALID_CREDENTIALS`, `SESSION_EXPIRED` |
| 403  | `FORBIDDEN`, `BAD_ORIGIN`                                   |
| 404  | `NOT_FOUND`                                                 |
| 413  | `EXPORT_TOO_LARGE`                                          |
| 422  | `VALIDATION_ERROR`                                          |
| 500  | `INTERNAL`                                                  |

`IP_BLOCKED` and `RATE_LIMITED` still exist in the `ErrorCode` enum and still map
to `403` and `429`, but nothing raises them any more. They are kept so the
frontend's error handling keeps working if a limit is ever reinstated.

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
   - Support erasure on request — `DELETE /api/admin/leads/:id` (admin only) covers
     it manually in v1. The deletion is logged to Pino, not to a database table.
   - Grievance officer details already published at `/grievance`.
8. **Backups:** nightly `pg_dump` to storage separate from the database host,
   7-day retention minimum, and a restore tested at least once before launch. An
   untested backup is a guess.
9. **Known gaps** created by the scope change at the top of this document, listed
   here so they are not rediscovered as surprises:
   - `POST /api/leads` has no rate limit. A single client can insert leads as fast
     as it can send them; Turnstile is the only thing in the way.
   - `POST /api/auth/login` has no throttle. Password guessing is bounded only by
     Argon2id's cost.
   - No audit trail. Exports and deletions of personal data are not recorded in a
     queryable form.

---

## 12. Frontend integration

### Done — lead capture

`useApplicationForm.ts` POSTs to `/api/leads` through `src/lib/api.ts`, which sets
`credentials: 'include'` and parses the §10 error shape into a typed
`ApiRequestError`. The hook sends the honeypot (`website`), stamps `renderedAt` on
mount, reads a Turnstile token from the `cf-turnstile-response` input when one
exists, and captures `utm_*` params and `pageUrl`. On failure the form shows the
server's message plus the WhatsApp and phone fallbacks.

Consent lives in `src/data/site.ts` as `consent.text` — **one string that the
checkbox renders and the request sends**, so `leads.consent_text` cannot drift from
what was on screen. Changing the wording means bumping `consent.version`.

In development `vite.config.ts` proxies `/api` to `localhost:8080`, keeping the
browser same-origin so the session cookie behaves as it will in production.
`VITE_API_BASE_URL` overrides this when the API is on another origin.

### Not built yet — dashboard and Turnstile

| Route        | Access    | Notes                                                            |
| ------------ | --------- | ---------------------------------------------------------------- |
| `/login`     | Public    | Email + password. On `200`, cookie is set; redirect to `/leads`. |
| `/leads`     | Protected | Table, filters, export button.                                   |
| `/leads/:id` | Protected | Detail drawer or page.                                           |

- Every request uses `credentials: 'include'`. There is no token to attach —
  the cookie handles it.
- On load, call `GET /api/auth/me`. `401` → redirect to `/login`.
- A `401` from any call → clear local state, redirect to `/login`.
- Export triggers a normal browser navigation/download to the export URL with the
  current filters as query params, so the download uses the same cookie.
- The **Turnstile widget** still has to be mounted in the form. The token plumbing
  is already in place; only the widget and `VITE_TURNSTILE_SITE_KEY` are missing.
  With rate limiting removed this is no longer optional hardening — it is the only
  real protection the lead endpoint has.

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

Verified locally on 25 August 2026 against Postgres 16:

- [x] A valid submission from the site appears in `leads` within 2 seconds.
- [x] A submission with the honeypot filled returns success and stores nothing.
- [x] A submission faster than `BOT_MIN_FORM_SECONDS` returns success and stores nothing.
- [x] The same mobile submitted twice in an hour produces exactly one lead (`200 duplicate: true`).
- [x] `consent: false` is rejected with `422` and nothing is stored.
- [x] `consent_text` stored on the lead is byte-identical to the string rendered in the form.
- [x] A submission with a foreign `Origin` is rejected with `403 BAD_ORIGIN`.
- [x] Unauthenticated `GET /api/admin/leads` returns `401`.
- [x] Mobile numbers in the exported `.xlsx` open as text, with all 10 digits.
- [x] The JWT cookie is `HttpOnly` and unreadable from `document.cookie`.

Superseded by the scope change — these no longer hold and must not be re-added as
tests without first restoring the tables they depend on:

- [~] ~~Four rapid submissions from one IP: three stored, the fourth returns `429`.~~
  All four are now stored.
- [~] ~~A forged `X-Forwarded-For` header does not bypass the IP rate limit.~~
  There is no IP rate limit to bypass. `TRUST_PROXY` still matters for the
  accuracy of `leads.ip` and the `burst_ip` flag.

- [x] Filtering by loan type and a date range returns the same row count as the
      export produced with those filters, and as `/leads/stats`. _(This was broken
      until 25 August 2026 — `loanType`, `status` and `employment` were built as
      `= any(<js array>)`, which drizzle expands to a tuple and Postgres rejects.
      Every request using one of those three filters returned `500`, on the list,
      the export and the stats endpoint alike. Fixed by switching to `inArray`.)_

Still outstanding:

- [ ] Turnstile is configured and rejecting tokenless submissions in production.
- [ ] A `pg_dump` backup has been restored into a scratch database successfully.
