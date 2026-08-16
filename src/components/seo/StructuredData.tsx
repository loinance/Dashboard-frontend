import { site } from '../../data/site'
import { loanTypes } from '../../data/loanTypes'

/** `<` inside JSON strings would otherwise be able to close the script tag. */
function serialise(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

const organisationId = `${site.url}/#organization`

/**
 * Schema.org markup for the business itself. `FinancialService` inherits from
 * LocalBusiness, so the address and phone feed local search and the knowledge
 * panel — the two things that matter most for "loan agent in Bengaluru".
 */
export function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FinancialService',
        '@id': organisationId,
        name: site.legalName,
        alternateName: site.name,
        url: site.url,
        logo: `${site.url}/logo.png`,
        image: `${site.url}/logo.png`,
        telephone: site.phoneHref.replace('tel:', ''),
        email: site.email,
        description:
          'Independent loan distributor working with 14 banks and NBFCs across India. One application, compared offers, and help with paperwork through to disbursal. Free for borrowers.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '949, 28th Main, Jayanagar 9th Block',
          addressLocality: 'Bengaluru',
          addressRegion: 'Karnataka',
          postalCode: '560041',
          addressCountry: 'IN',
        },
        areaServed: { '@type': 'Country', name: 'India' },
        foundingDate: String(site.since),
        currenciesAccepted: 'INR',
        // Our service is free to the borrower; lenders pay the commission.
        priceRange: 'Free',
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
            ],
            opens: '09:00',
            closes: '20:00',
          },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Loan products',
          itemListElement: loanTypes.map((loan) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: loan.name,
              description: loan.description,
              provider: { '@id': organisationId },
              areaServed: { '@type': 'Country', name: 'India' },
            },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: site.url,
        name: site.legalName,
        publisher: { '@id': organisationId },
        inLanguage: 'en-IN',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialise(data) }}
    />
  )
}
