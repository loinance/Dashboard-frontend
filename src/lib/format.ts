/** Indian-numbering helpers. All money on this site is INR. */

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

/** 600000 -> "6,00,000" */
export function formatNumber(value: number): string {
  return inr.format(Math.round(value))
}

/** 600000 -> "₹6,00,000" */
export function formatRupees(value: number): string {
  return `₹${formatNumber(value)}`
}

/** 600000 -> "₹6 L", 12500000 -> "₹1.25 Cr" — the compact form used on sliders. */
export function formatCompactRupees(value: number): string {
  const lakhs = value / 100_000
  if (lakhs >= 100) {
    const crores = (lakhs / 100).toFixed(2).replace(/\.00$/, '')
    return `₹${crores} Cr`
  }
  return `₹${lakhs.toFixed(lakhs % 1 ? 1 : 0)} L`
}

/** 48 -> "4 years", 12 -> "1 year", 30 -> "30 months" */
export function formatTenure(months: number): string {
  if (months % 12 !== 0) return `${months} months`
  const years = months / 12
  return `${years} ${years === 1 ? 'year' : 'years'}`
}

/** 10.49 -> "10.49%" */
export function formatRate(rate: number): string {
  return `${rate.toFixed(2)}%`
}

/** Strips everything but digits — for money inputs the user types into. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}
