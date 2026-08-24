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
import { consent as consentCopy, site } from '../../data/site'
import { digitsOnly, formatNumber } from '../../lib/format'
import styles from './ApplicationForm.module.css'

/** The hero's lead-capture card. */
export function ApplicationForm() {
  const { values, setField, status, errorMessage, fieldErrors, handleSubmit } =
    useApplicationForm()

  const money = (raw: string) => (raw ? formatNumber(Number(raw)) : '')

  /* The consent wording is one string in `data/site.ts` because that exact
     string is what gets stored — see the note there. Split it around the link
     label so the privacy link stays clickable without forking the copy. */
  const [beforeLink, afterLink] = consentCopy.text.split(consentCopy.linkLabel)

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
          <Field label="Amount needed" error={fieldErrors.amount}>
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
          <Field label="Monthly income" error={fieldErrors.income}>
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
          <Field label="Full name" error={fieldErrors.fullName}>
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
          <Field label="Mobile" error={fieldErrors.mobile}>
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
              {beforeLink}
              <SmartLink href={consentCopy.linkHref}>{consentCopy.linkLabel}</SmartLink>
              {afterLink}
            </>
          }
        />

        {/* §5.2 honeypot. Hidden from people and from assistive tech; a filled
            value tells the server this was a bot. Not `display: none` — some
            fillers skip those. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(event) => setField('website', event.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="green"
          size="block"
          className={styles.submit}
          disabled={status === 'submitting' || !values.consent}
        >
          {status === 'submitting' ? 'Sending…' : 'Request a callback'}
        </Button>

        {status === 'error' && (
          <p className={styles.error} role="alert">
            {errorMessage}{' '}
            {/* The lead matters more than the form. Always leave a way through. */}
            <SmartLink href={site.whatsapp}>Message us on WhatsApp</SmartLink> or call{' '}
            <SmartLink href={site.phoneHref}>{site.phone}</SmartLink>.
          </p>
        )}

        <p className={styles.note} role="status">
          {status === 'submitted'
            ? "Thanks — we'll call you within the hour."
            : 'No credit-score impact · We never sell your data'}
        </p>
      </form>
    </Card>
  )
}
