import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { Select } from '../components/ui/Select'
import { Seo } from '../components/seo/Seo'
import { ApiRequestError, getJson, patchJson } from '../lib/api'
import { formatIstDateTime } from '../lib/datetime'
import { formatRupees } from '../lib/format'
import {
  EMPLOYMENT_LABELS,
  LEAD_STATUSES,
  LOAN_TYPE_LABELS,
  RISK_FLAG_LABELS,
  STATUS_LABELS,
} from '../data/leads'
import type { LeadFull, LeadStatus } from '../data/leads'
import { pageSeo } from '../data/seo'
import styles from './LeadDetailPage.module.css'

const statusOptions = LEAD_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}))

interface LeadResponse {
  data: LeadFull
}

/** §12 — the full record for one lead, including the consent audit. */
export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [lead, setLead] = useState<LeadFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [status, setStatus] = useState<LeadStatus>('new')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)

    getJson<LeadResponse>(`/api/admin/leads/${id}`)
      .then(({ data }) => {
        if (cancelled) return
        setLead(data)
        setStatus(data.status)
        setNotes(data.notes ?? '')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof ApiRequestError && err.status === 401) return
        setError(
          err instanceof ApiRequestError ? err.message : 'Could not load this lead.',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const save = useCallback(async () => {
    if (!id || saving) return
    setSaving(true)
    setSaved(false)
    setSaveError(null)

    try {
      const { data } = await patchJson<LeadResponse>(`/api/admin/leads/${id}`, {
        status,
        notes: notes.trim() === '' ? null : notes,
      })
      setLead(data)
      setSaved(true)
    } catch (err) {
      setSaveError(
        err instanceof ApiRequestError ? err.message : 'Could not save. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }, [id, status, notes, saving])

  if (loading) {
    return (
      <p className={styles.state} role="status">
        Loading lead…
      </p>
    )
  }

  if (error || !lead) {
    return (
      <div className={styles.state}>
        <p className={styles.stateText}>{error ?? 'That lead no longer exists.'}</p>
        <Link to="/leads" className={styles.back}>
          ← Back to leads
        </Link>
      </div>
    )
  }

  const dirty = status !== lead.status || notes !== (lead.notes ?? '')

  return (
    <>
      <Seo {...pageSeo.leadDetail} />

      <div className={styles.page}>
        <Link to="/leads" className={styles.back}>
          ← Back to leads
        </Link>

        <header className={styles.head}>
          <div className={styles.identity}>
            <h1 className={styles.title}>{lead.fullName}</h1>
            <p className={styles.meta}>
              Received {formatIstDateTime(lead.createdAt)} · {lead.source}
            </p>
          </div>

          <div className={styles.actions}>
            <a className={styles.call} href={`tel:+91${lead.mobile}`}>
              Call +91 {lead.mobile}
            </a>
            <a
              className={styles.whatsapp}
              href={`https://wa.me/91${lead.mobile}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </header>

        {lead.isSuspect && (
          <div className={styles.flags} role="note">
            <strong className={styles.flagsTitle}>Flagged for review</strong>
            <ul className={styles.flagList}>
              {lead.riskFlags.map((flag) => (
                <li key={flag}>{RISK_FLAG_LABELS[flag] ?? flag}</li>
              ))}
            </ul>
            <p className={styles.flagsNote}>
              A flag is a hint, not a verdict — flagged leads are still real people.
            </p>
          </div>
        )}

        <div className={styles.columns}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Application</h2>
            <dl className={styles.facts}>
              <Fact label="Loan type" value={LOAN_TYPE_LABELS[lead.loanType] ?? lead.loanType} />
              <Fact label="Amount" value={formatRupees(lead.amount)} />
              <Fact label="Monthly income" value={formatRupees(lead.income)} />
              <Fact
                label="Employment"
                value={EMPLOYMENT_LABELS[lead.employment] ?? lead.employment}
              />
              <Fact label="Mobile" value={lead.mobile} />
              <Fact label="First call" value={formatIstDateTime(lead.firstCallAt)} />
            </dl>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Workflow</h2>

            <Field label="Status">
              {(fieldId) => (
                <Select
                  id={fieldId}
                  options={statusOptions}
                  value={status}
                  onChange={(event) => setStatus(event.target.value as LeadStatus)}
                />
              )}
            </Field>

            <label className={styles.notesLabel} htmlFor="lead-notes">
              Notes
            </label>
            <textarea
              id="lead-notes"
              className={styles.notes}
              rows={5}
              placeholder="What happened on the call?"
              value={notes}
              maxLength={5000}
              onChange={(event) => setNotes(event.target.value)}
            />

            {saveError && (
              <p className={styles.saveError} role="alert">
                {saveError}
              </p>
            )}

            <div className={styles.saveRow}>
              <Button
                variant="green"
                size="sm"
                onClick={() => void save()}
                disabled={saving || !dirty}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
              {saved && !dirty && <span className={styles.savedNote}>Saved</span>}
            </div>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Consent</h2>
            <dl className={styles.facts}>
              <Fact label="Agreed at" value={formatIstDateTime(lead.consentAt)} />
              <Fact label="Version" value={lead.consentVersion} />
            </dl>
            {/* Stored verbatim under DPDP — the point is being able to show the
                exact wording that was on screen, so it is quoted, not summarised. */}
            <blockquote className={styles.consent}>{lead.consentText}</blockquote>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Where it came from</h2>
            <dl className={styles.facts}>
              <Fact label="IP" value={lead.ip ?? '—'} mono />
              <Fact label="Page" value={lead.pageUrl ?? '—'} mono />
              <Fact label="Referrer" value={lead.referer ?? '—'} mono />
              <Fact
                label="Campaign"
                value={
                  lead.utm
                    ? Object.entries(lead.utm)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')
                    : '—'
                }
              />
              <Fact label="Browser" value={lead.userAgent ?? '—'} mono />
              <Fact label="Last updated" value={formatIstDateTime(lead.updatedAt)} />
            </dl>
          </section>
        </div>
      </div>
    </>
  )
}

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className={styles.fact}>
      <dt className={styles.factLabel}>{label}</dt>
      <dd className={mono ? styles.factValueMono : styles.factValue}>{value}</dd>
    </div>
  )
}
