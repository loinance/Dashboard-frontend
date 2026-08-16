import { Seo } from '../components/seo/Seo'
import { OrganizationSchema } from '../components/seo/StructuredData'
import { pageSeo } from '../data/seo'
import { Hero } from '../components/sections/Hero'
import { BankStrip } from '../components/sections/BankStrip'
import { LoanTypes } from '../components/sections/LoanTypes'
import { EmiCalculator } from '../components/sections/EmiCalculator'
import { HowItWorks } from '../components/sections/HowItWorks'
import { ContactCta } from '../components/sections/ContactCta'

export function HomePage() {
  return (
    <>
      <Seo {...pageSeo.home} />
      <OrganizationSchema />

      <Hero />
      <BankStrip />
      <LoanTypes />
      <EmiCalculator />
      <HowItWorks />
      <ContactCta />
    </>
  )
}
