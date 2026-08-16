import { useMemo, useState } from 'react'
import { calculateEmi, requiredIncome } from '../lib/emi'
import {
  formatCompactRupees,
  formatNumber,
  formatRate,
  formatRupees,
  formatTenure,
} from '../lib/format'

export interface EmiCalculatorOptions {
  defaultAmount?: number
  /** Tenure in months. */
  defaultTenure?: number
  /** Annual rate, e.g. 10.49 — the rate we typically get approved. */
  defaultRate?: number
  /** Fixed-obligation-to-income cap used for the "income needed" figure. */
  foirCap?: number
}

export const emiLimits = {
  amount: { min: 50_000, max: 10_000_000, step: 50_000 },
  tenure: { min: 12, max: 240, step: 12 },
  rate: { min: 7, max: 24, step: 0.25 },
} as const

/** Owns the three slider values and everything derived from them. */
export function useEmiCalculator({
  defaultAmount = 600_000,
  defaultTenure = 48,
  defaultRate = 10.49,
  foirCap = 0.5,
}: EmiCalculatorOptions = {}) {
  const [amount, setAmount] = useState(defaultAmount)
  const [tenure, setTenure] = useState(defaultTenure)
  const [rate, setRate] = useState(defaultRate)

  const result = useMemo(
    () => calculateEmi(amount, rate, tenure),
    [amount, rate, tenure],
  )

  const labels = useMemo(
    () => ({
      amount: formatCompactRupees(amount),
      tenure: formatTenure(tenure),
      rate: formatRate(rate),
      emi: formatNumber(result.emi),
      totalInterest: formatRupees(result.totalInterest),
      totalPayable: formatRupees(result.totalPayable),
      incomeNeeded: `${formatRupees(requiredIncome(result.emi, foirCap))}/mo`,
      principalShare: `${result.principalShare.toFixed(1)}%`,
    }),
    [amount, tenure, rate, result, foirCap],
  )

  return { amount, tenure, rate, setAmount, setTenure, setRate, result, labels }
}
