import { LoanCard } from './LoanCard'
import { Section } from '../layout/Section'
import { SectionHeading } from '../ui/SectionHeading'
import { loanTypes } from '../../data/loanTypes'
import styles from './LoanTypes.module.css'

export function LoanTypes() {
  return (
    <Section id="loans" ariaLabel="Loan products" className={styles.section}>
      <SectionHeading
        title="What do you need money for?"
        aside="Every type below is handled by a named advisor, not a call centre."
      />

      <div className={styles.grid}>
        {loanTypes.map((loan) => (
          <LoanCard key={loan.id} loan={loan} />
        ))}
      </div>
    </Section>
  )
}
