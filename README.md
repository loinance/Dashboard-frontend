# Loinance Solutions — front end

React 19 + TypeScript + Vite. The marketing site from the Claude Design file
`Finmaxs Website.dc.html`, rebranded to Loinance Solutions Pvt Ltd and rebuilt
as components.

```bash
npm run dev      # vite dev server
npm run build    # tsc -b && vite build
npm run lint     # oxlint
```

## How it's organised

```
src/
├─ styles/
│  ├─ tokens.css          design tokens — colours, type, radii, gutter
│  └─ global.css          reset + base element styles
├─ data/                  all copy and lists (no strings hard-coded in JSX)
│  ├─ site.ts             contact details, nav, footer columns, hero stats
│  ├─ loanTypes.ts  banks.ts  steps.ts  testimonials.ts
├─ lib/
│  ├─ emi.ts              EMI maths (reducing balance) + FOIR income
│  ├─ format.ts           ₹ / Indian-numbering / tenure formatters
│  └─ cx.ts               classname joiner
├─ hooks/
│  ├─ useEmiCalculator.ts slider state + derived labels
│  └─ useApplicationForm.ts  lead-form state, options, submit stub
├─ pages/
│  ├─ HomePage.tsx  NotFoundPage.tsx
│  └─ legal/              PrivacyPolicyPage TermsOfUsePage GrievancePage
└─ components/
   ├─ ui/                 Button ChipGroup Checkbox Field Slider Card Eyebrow
   │                      SectionHeading Stat Tag Hatch StatusDot SmartLink
   ├─ layout/             RootLayout ScrollManager AnnouncementBar SiteHeader
   │                      SiteFooter Logo Section LegalPage
   └─ sections/           Hero ApplicationForm BankStrip LoanTypes LoanCard
                          EmiCalculator EmiSummary HowItWorks ContactCta
```

`App.tsx` holds the routes; `pages/HomePage.tsx` is the running order of the
marketing sections.

## Routes

| Path | Page |
| --- | --- |
| `/` | marketing home |
| `/privacy` | privacy policy |
| `/terms` | terms of use |
| `/grievance` | grievance redressal |
| `*` | 404 |

`react-router-dom` with `BrowserRouter`. **Deployment note:** clean URLs need an
SPA fallback on the host, or `/privacy` will 404 on a hard refresh — a
`try_files $uri /index.html` in nginx, a `_redirects` rule on Netlify, or a
rewrite on Vercel.

Nav links use `/#emi` rather than `#emi` so they work from the legal pages too;
`ScrollManager` scrolls to the section after the router navigates home.
`SmartLink` renders a router `Link` for in-app paths and a plain `<a>` for
`tel:`, `mailto:` and external URLs.

## SEO

Per-page metadata lives in `data/seo.ts` and is rendered by
`components/seo/Seo.tsx`. React 19 hoists `title`/`meta`/`link` into `<head>`
natively, so there is no helmet library. `components/seo/StructuredData.tsx`
emits `FinancialService` + `WebSite` JSON-LD built from `data/site.ts` and
`data/loanTypes.ts`, so the schema can't drift from the page.

`public/robots.txt` and `public/sitemap.xml` are static — **add new routes to
the sitemap by hand.** Both, plus every canonical URL, are built from
`site.url`, which must be set to the real production domain before launch.

**The metadata is written by JavaScript.** Crawlers that don't execute JS —
WhatsApp, Facebook and LinkedIn link previews — only ever see the fallback tags
in `index.html`, which currently mirror the home page. Keep the two in step, or
pre-render (see below) and the problem goes away.

Outstanding:

- `og:image` — needs a 1200×630 PNG at `public/og-image.png`, then add the tag
  to `Seo.tsx` and `index.html`. Until then link previews show no picture.
- No pre-rendering. This is the biggest remaining lever.

## Legal pages — read before launch

`pages/legal/*` are **drafts for a lawyer to review**, not finished legal text.

Everything in `[square brackets]` is a placeholder and renders verbatim on the
live page so it cannot be missed — CIN, GSTIN, the Grievance Officer's name and
designation, the data-retention period, and the jurisdiction clause. Fill them
in `data/site.ts` (`legal`) before going live.

The application form now carries a DPDP consent checkbox. It starts unticked
and gates the submit button. When you wire the lead API, store the consent
timestamp *and the wording shown* — you have to be able to prove what was
agreed to.

`sections/Testimonials.tsx` and `data/testimonials.ts` exist but are **not
rendered** — the quotes carried over from the design aren't real. Add it back to
`App.tsx` once there are genuine ones.

### Styling

CSS Modules, one `.module.css` beside each component. Every colour, font, radius
and the page gutter come from custom properties in `styles/tokens.css` — nothing
below that file hard-codes a hex value, so a rebrand is a single-file change.

`Section` sets its padding from `--section-top` / `--section-bottom`, which a
section's own module redefines. That keeps overrides independent of stylesheet
order.

### State

- **EMI calculator** is live. `useEmiCalculator` owns amount/tenure/rate and
  returns both raw numbers and formatted labels; `EmiSummary` is presentational
  so it can be reused on a loan detail page.
- **Application form** is controlled but not wired. `useApplicationForm`
  holds the values and `handleSubmit` currently logs them — replace the marked
  `TODO` with the lead endpoint.

### Still to wire up

- Bank logos, product icons, testimonial avatars and the WhatsApp QR render as
  `<Hatch />` placeholders. Swap each for an `<img>` as artwork lands.
- Nav entries pointing at `/partners`, `/about`, `/privacy`, `/terms` and
  `/grievance` need a router; hash links work today.
