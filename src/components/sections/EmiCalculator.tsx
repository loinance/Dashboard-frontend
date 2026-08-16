import { EmiSummary } from './EmiSummary'
import { Section } from '../layout/Section'
import { Slider } from '../ui/Slider'
import { emiLimits, useEmiCalculator } from '../../hooks/useEmiCalculator'
import type { EmiCalculatorOptions } from '../../hooks/useEmiCalculator'
import styles from './EmiCalculator.module.css'

export function EmiCalculator(options: EmiCalculatorOptions = {}) {
  const { amount, tenure, rate, setAmount, setTenure, setRate, labels } =
    useEmiCalculator(options)

  return (
    <Section id="emi" ariaLabel="EMI calculator">
      <div className={styles.panel}>
        <div className={styles.controls}>
          <h2 className={styles.title}>Work out the EMI before you commit</h2>
          <p className={styles.lede}>
            Drag the sliders. This is the real repayment at the rate we
            typically get approved for a salaried applicant with a 750+ score.
          </p>

          <div className={styles.sliders}>
            <Slider
              label="Loan amount"
              display={labels.amount}
              value={amount}
              onChange={setAmount}
              minLabel="₹50K"
              maxLabel="₹1 Cr"
              {...emiLimits.amount}
            />
            <Slider
              label="Tenure"
              display={labels.tenure}
              value={tenure}
              onChange={setTenure}
              minLabel="1 yr"
              maxLabel="20 yrs"
              {...emiLimits.tenure}
            />
            <Slider
              label="Interest rate"
              display={labels.rate}
              value={rate}
              onChange={setRate}
              minLabel="7%"
              maxLabel="24%"
              {...emiLimits.rate}
            />
          </div>
        </div>

        <EmiSummary
          emi={labels.emi}
          totalInterest={labels.totalInterest}
          totalPayable={labels.totalPayable}
          incomeNeeded={labels.incomeNeeded}
          principalShare={labels.principalShare}
        />
      </div>
    </Section>
  )
}
