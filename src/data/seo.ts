import { site } from './site'

export interface PageSeo {
  /** Aim for under ~60 characters so Google doesn't truncate it. */
  title: string
  /** Aim for 150–160 characters. */
  description: string
  path: string
  noIndex?: boolean
}

export const pageSeo = {
  home: {
    title: 'Loans in Bengaluru — compare 14 banks | Loinance Solutions',
    description:
      'One application to HDFC, SBI, Kotak, Axis and 10 more lenders. Personal, home, business, car and mortgage loans, typically sanctioned in 48 hours. Free — banks pay us.',
    path: '/',
  },
  privacy: {
    title: 'Privacy policy | Loinance Solutions',
    description: `How ${site.legalName} collects, uses, shares and protects the personal data you submit through this site, and the rights you have over it.`,
    path: '/privacy',
  },
  terms: {
    title: 'Terms of use | Loinance Solutions',
    description: `The terms on which you may use the ${site.legalName} website and loan distribution service. We are not a lender and we charge borrowers nothing.`,
    path: '/terms',
  },
  grievance: {
    title: 'Grievance redressal | Loinance Solutions',
    description: `How to raise a complaint with ${site.legalName}, our Grievance Officer's details, resolution timelines, and how to escalate to the RBI Ombudsman.`,
    path: '/grievance',
  },
  notFound: {
    title: 'Page not found | Loinance Solutions',
    description: 'The page you were looking for does not exist.',
    path: '/404',
    noIndex: true,
  },
} satisfies Record<string, PageSeo>
