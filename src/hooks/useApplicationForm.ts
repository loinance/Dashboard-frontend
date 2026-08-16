import { useCallback, useState } from 'react'
import type { FormEvent } from 'react'
import type { ChipOption } from '../components/ui/ChipGroup'

export type LoanTypeValue =
  | 'personal'
  | 'home'
  | 'business'
  | 'car'
  | 'mortgage'
  | 'credit-card'

export type EmploymentValue = 'salaried' | 'self-employed' | 'business-owner'

export const loanTypeOptions: ChipOption<LoanTypeValue>[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'home', label: 'Home' },
  { value: 'business', label: 'Business' },
  { value: 'car', label: 'Car' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'credit-card', label: 'Credit card' },
]

export const employmentOptions: ChipOption<EmploymentValue>[] = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self-employed', label: 'Self-employed' },
  { value: 'business-owner', label: 'Business owner' },
]

export interface ApplicationValues {
  loanType: LoanTypeValue
  /** Digits only; formatted for display at the input. */
  amount: string
  income: string
  fullName: string
  mobile: string
  employment: EmploymentValue
  /** DPDP consent. Must never start true — the person has to tick it. */
  consent: boolean
}

export type ApplicationStatus = 'idle' | 'submitting' | 'submitted' | 'error'

const initialValues: ApplicationValues = {
  loanType: 'personal',
  amount: '600000',
  income: '85000',
  fullName: '',
  mobile: '',
  employment: 'salaried',
  consent: false,
}

/**
 * Local state for the hero application card. Submission is intentionally a
 * no-op stub — wire it to the lead endpoint when the backend is ready.
 */
export function useApplicationForm(overrides?: Partial<ApplicationValues>) {
  const [values, setValues] = useState<ApplicationValues>({
    ...initialValues,
    ...overrides,
  })
  const [status, setStatus] = useState<ApplicationStatus>('idle')

  const setField = useCallback(
    <K extends keyof ApplicationValues>(key: K, value: ApplicationValues[K]) => {
      setValues((current) => ({ ...current, [key]: value }))
    },
    [],
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setStatus('idle')
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!values.consent) return
      setStatus('submitting')

      // TODO: wire to the lead API, e.g.
      //   await fetch('/api/leads', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ ...values, consentedAt: new Date().toISOString() }),
      //   })
      // Record the consent timestamp and the exact wording shown — under DPDP
      // you must be able to show what the person agreed to, and when.
      console.info('[loinance] application submitted', values)
      setStatus('submitted')
    },
    [values],
  )

  return { values, setField, status, reset, handleSubmit }
}
