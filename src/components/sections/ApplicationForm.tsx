import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Checkbox } from '../ui/Checkbox'
import { ChipGroup } from '../ui/ChipGroup'
import { Field, FieldGroup, TextInput } from '../ui/Field'
import { SmartLink } from '../ui/SmartLink'
import {
  employmentOptions,
  loanTypeOptions,
  useApplicationForm,
} from '../../hooks/useApplicationForm'
import { site } from '../../data/site'
import { digitsOnly, formatNumber } from '../../lib/format'
import styles from './ApplicationForm.module.css'

/** The hero's lead-capture card. */
export function ApplicationForm() {
  const { values, setField, status, handleSubmit } = useApplicationForm()

  const money = (raw: string) => (raw ? formatNumber(Number(raw)) : '')

  return (
    <Card id="apply" raised className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>Start your application</h2>
        <span className={styles.duration}>TAKES ~2 MIN</span>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <FieldGroup label="Loan type">
          <ChipGroup
            label="Loan type"
            options={loanTypeOptions}
            value={values.loanType}
            onChange={(value) => setField('loanType', value)}
          />
        </FieldGroup>

        <div className={styles.pair}>
          <Field label="Amount needed">
            {(id) => (
              <TextInput
                id={id}
                prefix="₹"
                inputMode="numeric"
                autoComplete="off"
                placeholder="6,00,000"
                value={money(values.amount)}
                onChange={(event) =>
                  setField('amount', digitsOnly(event.target.value))
                }
              />
            )}
          </Field>
          <Field label="Monthly income">
            {(id) => (
              <TextInput
                id={id}
                prefix="₹"
                inputMode="numeric"
                autoComplete="off"
                placeholder="85,000"
                value={money(values.income)}
                onChange={(event) =>
                  setField('income', digitsOnly(event.target.value))
                }
              />
            )}
          </Field>
        </div>

        <div className={styles.pair}>
          <Field label="Full name">
            {(id) => (
              <TextInput
                id={id}
                placeholder="As on PAN"
                autoComplete="name"
                value={values.fullName}
                onChange={(event) => setField('fullName', event.target.value)}
              />
            )}
          </Field>
          <Field label="Mobile">
            {(id) => (
              <TextInput
                id={id}
                prefix="+91"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="—"
                autoComplete="tel-national"
                value={values.mobile}
                onChange={(event) =>
                  setField('mobile', digitsOnly(event.target.value))
                }
              />
            )}
          </Field>
        </div>

        <ChipGroup
          label="Employment type"
          options={employmentOptions}
          value={values.employment}
          onChange={(value) => setField('employment', value)}
        />

        <Checkbox
          className={styles.consent}
          checked={values.consent}
          onChange={(event) => setField('consent', event.target.checked)}
          label={
            <>
              I agree that {site.name} may share these details with its partner
              lenders to check my eligibility, and may contact me about this
              enquiry by phone, WhatsApp and email. See the{' '}
              <SmartLink href="/privacy">privacy policy</SmartLink>.
            </>
          }
        />

        <Button
          type="submit"
          variant="green"
          size="block"
          className={styles.submit}
          disabled={status === 'submitting' || !values.consent}
        >
          {status === 'submitting' ? 'Sending…' : 'Request a callback'}
        </Button>

        <p className={styles.note} role="status">
          {status === 'submitted'
            ? "Thanks — we'll call you within the hour."
            : 'No credit-score impact · We never sell your data'}
        </p>
      </form>
    </Card>
  )
}
