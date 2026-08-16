import { Button } from '../ui/Button'
import styles from './EmiSummary.module.css'

interface EmiSummaryProps {
  emi: string
  totalInterest: string
  totalPayable: string
  incomeNeeded: string
  /** Principal's share of total repayment, as a CSS width e.g. "62.4%". */
  principalShare: string
}

/** Read-out panel for the EMI calculator — reusable on loan detail pages. */
export function EmiSummary({
  emi,
  totalInterest,
  totalPayable,
  incomeNeeded,
  principalShare,
}: EmiSummaryProps) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.caption}>MONTHLY EMI</h3>

      <p className={styles.amount}>
        <span className={styles.currency}>₹</span>
        <span className={styles.figure}>{emi}</span>
      </p>

      <div
        className={styles.meter}
        role="img"
        aria-label={`Principal is ${principalShare} of total repayment`}
      >
        <div className={styles.principal} style={{ width: principalShare }} />
      </div>
      <div className={styles.meterLegend}>
        <span>Principal</span>
        <span>Interest</span>
      </div>

      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt>Total interest</dt>
          <dd>{totalInterest}</dd>
        </div>
        <div className={styles.row}>
          <dt>Total repayment</dt>
          <dd>{totalPayable}</dd>
        </div>
        <div className={styles.row}>
          <dt>Income needed</dt>
          <dd>{incomeNeeded}</dd>
        </div>
      </dl>

      <Button href="#apply" variant="mint" size="block" className={styles.cta}>
        Get this approved
      </Button>
    </div>
  )
}
