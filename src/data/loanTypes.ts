export interface LoanType {
  id: string
  name: string
  /** Mono eyebrow above the title — a starting rate, or a standing offer. */
  eyebrow: string
  description: string
  ctaLabel: string
  href: string
  /** Renders on the dark ink card instead of the light surface. */
  featured?: boolean
}

export const loanTypes: LoanType[] = [
  {
    id: 'personal',
    name: 'Personal loan',
    eyebrow: 'FROM 10.49%',
    description:
      'Up to ₹40L with no collateral. Wedding, medical, travel or consolidating an expensive card.',
    ctaLabel: 'Check eligibility →',
    href: '#apply',
  },
  {
    id: 'home',
    name: 'Home loan',
    eyebrow: 'FROM 8.35%',
    description:
      'Purchase, balance transfer or top-up. We handle valuation and legal follow-ups with the bank.',
    ctaLabel: 'Check eligibility →',
    href: '#apply',
  },
  {
    id: 'mortgage',
    name: 'Mortgage / LAP',
    eyebrow: 'FROM 9.25%',
    description:
      'Large amounts against property, longer tenures, flexible repayment structures.',
    ctaLabel: 'Check eligibility →',
    href: '#apply',
  },
  {
    id: 'car',
    name: 'Car loan',
    eyebrow: 'FROM 8.75%',
    description:
      'New or used, up to 90% on-road funding, sanction before you visit the showroom.',
    ctaLabel: 'Check eligibility →',
    href: '#apply',
  },
  {
    id: 'business',
    name: 'Business loan',
    eyebrow: 'FROM 11.00%',
    description:
      'Working capital, machinery or expansion — unsecured up to ₹75L against GST and bank statements.',
    ctaLabel: 'Check eligibility →',
    href: '#apply',
  },
  {
    id: 'credit-card',
    name: 'Credit cards',
    eyebrow: 'LIFETIME FREE OPTIONS',
    description:
      'Matched to your spending — fuel, travel or cashback — with the annual fee waiver rules spelled out.',
    ctaLabel: 'See card matches →',
    href: '#apply',
    featured: true,
  },
]
