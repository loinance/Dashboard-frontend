export interface EmiBreakdown {
  /** Equated monthly instalment. */
  emi: number
  /** emi × tenure. */
  totalPayable: number
  /** totalPayable − principal. */
  totalInterest: number
  /** Principal as a share of total repayment, 0–100. */
  principalShare: number
}

/**
 * Standard reducing-balance EMI:  P·r·(1+r)^n / ((1+r)^n − 1)
 *
 * @param principal   loan amount in rupees
 * @param annualRate  nominal annual interest rate, e.g. 10.49
 * @param months      tenure in months
 */
export function calculateEmi(
  principal: number,
  annualRate: number,
  months: number,
): EmiBreakdown {
  if (principal <= 0 || months <= 0) {
    return { emi: 0, totalPayable: 0, totalInterest: 0, principalShare: 0 }
  }

  const monthlyRate = annualRate / 1200
  const emi =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)

  const totalPayable = emi * months

  return {
    emi,
    totalPayable,
    totalInterest: totalPayable - principal,
    principalShare: (principal / totalPayable) * 100,
  }
}

/**
 * Income a lender typically wants to see, derived from the FOIR
 * (fixed-obligation-to-income ratio) cap they underwrite to.
 */
export function requiredIncome(emi: number, foirCap = 0.5): number {
  return emi / foirCap
}
