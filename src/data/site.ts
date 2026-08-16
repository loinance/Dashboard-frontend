/** Everything a copy change would touch. Components read from here, never inline. */

export const site = {
  name: 'Loinance',
  legalName: 'Loinance Solutions Pvt Ltd',
  /**
   * Production origin, no trailing slash. Canonical URLs, the sitemap and all
   * structured data are built from this — pointing it at a domain you don't
   * own actively harms your ranking, so confirm it before launch.
   */
  url: 'https://www.loinance.com',
  city: 'Bengaluru',
  since: 2024,
  partnerCount: 14,
  phone: '+91 98444 93082',
  phoneHref: 'tel:+919844493082',
  whatsapp: 'https://wa.me/919844493082',
  email: 'mrityunjay@finmaxs.com',
  address: '949, 28th Main, Jayanagar 9th Block, Bengaluru 560041',
  hours: '9am–8pm',
  copyright: `© ${new Date().getFullYear()} Loinance Solutions Pvt Ltd. All rights reserved.`,
  disclaimer: "Rates shown are indicative and subject to the lender's approval.",
} as const

/**
 * Details that appear verbatim on the legal pages.
 *
 * Anything in [square brackets] is a placeholder that must be filled in
 * before launch — it renders as-is so it can't be missed.
 */
export const legal = {
  cin: '[CIN — from your certificate of incorporation]',
  gstin: '[GSTIN, if registered]',
  lastUpdated: '11 August 2026',
  /** Hours within which a complaint is acknowledged. */
  acknowledgementHours: 48,
  /** Days within which a complaint is resolved before it can be escalated. */
  resolutionDays: 30,
  grievanceOfficer: {
    name: '[Grievance Officer name]',
    designation: '[Designation]',
    email: site.email,
    phone: site.phone,
  },
} as const

export const announcement = {
  text: 'Our service is free for you — banks pay us, not you.',
  ctaLabel: 'Talk to an advisor on WhatsApp →',
  ctaHref: site.whatsapp,
} as const

export interface NavLink {
  label: string
  href: string
}

/* `/#id` rather than `#id` so these also work from the legal pages — the router
   navigates home and then scrolls to the section. */
export const primaryNav: NavLink[] = [
  { label: 'Loans', href: '/#loans' },
  { label: 'EMI calculator', href: '/#emi' },
  { label: 'How it works', href: '/#how' },
  { label: 'Partner banks', href: '/#banks' },
  { label: 'Contact', href: '/#contact' },
]

export interface FooterColumn {
  title: string
  links: NavLink[]
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Loans',
    links: [
      /* Ids come from `loanTypes`, applied by `LoanCard` as `loan-<id>`. */
      { label: 'Personal', href: '/#loan-personal' },
      { label: 'Home', href: '/#loan-home' },
      { label: 'Business', href: '/#loan-business' },
      { label: 'Car', href: '/#loan-car' },
      { label: 'Credit cards', href: '/#loan-credit-card' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'How it works', href: '/#how' },
      { label: 'Partner banks', href: '/#banks' },
      { label: 'EMI calculator', href: '/#emi' },
      { label: 'Contact', href: '/#contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of use', href: '/terms' },
      { label: 'Grievance redressal', href: '/grievance' },
    ],
  },
]

export const heroStats = [
  { value: '₹0', label: 'you pay us nothing' },
  { value: '48 hrs', label: 'typical sanction time' },
  { value: '6 types', label: 'of loans handled end-to-end' },
]
