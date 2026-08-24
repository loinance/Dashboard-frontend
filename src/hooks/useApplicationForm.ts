import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { ChipOption } from '../components/ui/ChipGroup'
import { consent as consentCopy } from '../data/site'
import { ApiRequestError, postJson } from '../lib/api'

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
  /**
   * Honeypot (§5.2). Hidden from people, irresistible to form-fillers. A
   * non-empty value means the submission is silently dropped by the server.
   */
  website: string
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
  website: '',
}

const UTM_KEYS = ['source', 'medium', 'campaign', 'term', 'content'] as const

/** `?utm_source=google&utm_medium=cpc` → `{ source: 'google', medium: 'cpc' }`. */
function readUtm(): Record<string, string> | undefined {
  if (typeof window === 'undefined') return undefined

  const params = new URLSearchParams(window.location.search)
  const utm: Record<string, string> = {}

  for (const key of UTM_KEYS) {
    const value = params.get(`utm_${key}`)
    if (value) utm[key] = value.slice(0, 200)
  }

  return Object.keys(utm).length > 0 ? utm : undefined
}

/**
 * Cloudflare Turnstile drops the token into a hidden input named
 * `cf-turnstile-response`. No widget mounted (development, or before the site
 * key is configured) means no token — the server skips the check when it has
 * no secret, and rejects with CAPTCHA_FAILED once it does.
 */
function readTurnstileToken(form: HTMLFormElement): string | undefined {
  const field = form.elements.namedItem('cf-turnstile-response')
  const token = field instanceof HTMLInputElement ? field.value : ''
  return token || undefined
}

export interface UseApplicationForm {
  values: ApplicationValues
  setField: <K extends keyof ApplicationValues>(key: K, value: ApplicationValues[K]) => void
  status: ApplicationStatus
  /** User-safe message from the server; only set when `status === 'error'`. */
  errorMessage: string | null
  /** Per-field messages from a 422, keyed by field name. */
  fieldErrors: Record<string, string>
  reset: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

interface CreateLeadResponse {
  ok: true
  id: string
  duplicate?: boolean
  message?: string
}

/**
 * Local state for the hero application card, wired to `POST /api/leads`.
 *
 * The server is the authority on validation (§7) — this sends what the person
 * typed and renders back whatever the server says, rather than duplicating the
 * rules and drifting from them.
 */
export function useApplicationForm(overrides?: Partial<ApplicationValues>) {
  const [values, setValues] = useState<ApplicationValues>({
    ...initialValues,
    ...overrides,
  })
  const [status, setStatus] = useState<ApplicationStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  /* §5.2 — the server rejects anything submitted less than
     BOT_MIN_FORM_SECONDS after the form appeared. Stamped once, on mount. */
  const renderedAt = useRef(Date.now())
  useEffect(() => {
    renderedAt.current = Date.now()
  }, [])

  const setField = useCallback(
    <K extends keyof ApplicationValues>(key: K, value: ApplicationValues[K]) => {
      setValues((current) => ({ ...current, [key]: value }))
      // Typing into a field that the server complained about clears its error.
      setFieldErrors((current) => {
        if (!(key in current)) return current
        const next = { ...current }
        delete next[key]
        return next
      })
    },
    [],
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setStatus('idle')
    setErrorMessage(null)
    setFieldErrors({})
    renderedAt.current = Date.now()
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!values.consent || status === 'submitting') return

      const form = event.currentTarget
      setStatus('submitting')
      setErrorMessage(null)
      setFieldErrors({})

      try {
        await postJson<CreateLeadResponse>('/api/leads', {
          fullName: values.fullName,
          mobile: values.mobile,
          loanType: values.loanType,
          amount: Number(values.amount),
          income: Number(values.income),
          employment: values.employment,

          /* Consent is stored with the exact wording that was on screen — the
             requirement is proving what was agreed to, not that something was. */
          consent: values.consent,
          consentText: consentCopy.text,
          consentVersion: consentCopy.version,

          website: values.website,
          renderedAt: renderedAt.current,
          turnstileToken: readTurnstileToken(form),

          source: 'hero',
          pageUrl: typeof window === 'undefined' ? undefined : window.location.href.slice(0, 500),
          utm: readUtm(),
        })

        // A duplicate inside the dedupe window is a success as far as the
        // person is concerned — they asked to be called, and they will be.
        setStatus('submitted')
      } catch (error) {
        const message =
          error instanceof ApiRequestError
            ? error.message
            : 'Something went wrong. Please try again.'

        if (error instanceof ApiRequestError) setFieldErrors(error.fields)
        setErrorMessage(message)
        setStatus('error')
      }
    },
    [values, status],
  )

  return { values, setField, status, errorMessage, fieldErrors, reset, handleSubmit }
}
