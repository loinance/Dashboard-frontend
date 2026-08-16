import { Section } from '../layout/Section'
import { SectionHeading } from '../ui/SectionHeading'
import { steps } from '../../data/steps'
import styles from './HowItWorks.module.css'

export function HowItWorks() {
  return (
    <Section id="how" ariaLabel="How it works">
      <SectionHeading
        title="How we earn our keep"
        description="The bank pays us a distribution commission when your loan is disbursed. That's why our service costs you nothing — and why we only send your file where it will actually get approved."
      />

      <ol className={styles.steps}>
        {steps.map((step) => (
          <li key={step.id} className={styles.step}>
            <span className={styles.number}>{step.id}</span>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.body}>{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
