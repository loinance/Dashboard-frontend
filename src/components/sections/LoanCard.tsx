import { Card } from '../ui/Card'
import { Eyebrow } from '../ui/Eyebrow'
import { Hatch } from '../ui/Hatch'
import { cx } from '../../lib/cx'
import type { LoanType } from '../../data/loanTypes'
import styles from './LoanCard.module.css'

export function LoanCard({ loan }: { loan: LoanType }) {
  const { featured } = loan

  return (
    <Card
      id={`loan-${loan.id}`}
      href={loan.href}
      tone={featured ? 'ink' : 'surface'}
      className={styles.card}
    >
      <div className={styles.top}>
        <Eyebrow tone={featured ? 'mint' : 'green'} className={styles.eyebrow}>
          {loan.eyebrow}
        </Eyebrow>
        <Hatch tone={featured ? 'dark' : 'light'} label={featured ? '' : 'icon'} />
      </div>

      <div>
        <h3 className={styles.name}>{loan.name}</h3>
        <p className={cx(styles.description, featured && styles.onDark)}>
          {loan.description}
        </p>
      </div>

      <span className={cx(styles.cta, featured && styles.ctaOnDark)}>
        {loan.ctaLabel}
      </span>
    </Card>
  )
}
