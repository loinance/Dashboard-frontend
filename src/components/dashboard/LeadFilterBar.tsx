import { Checkbox } from '../ui/Checkbox'
import { Field, TextInput } from '../ui/Field'
import { Select } from '../ui/Select'
import {
  EMPLOYMENT_LABELS,
  EMPLOYMENT_TYPES,
  LEAD_STATUSES,
  LOAN_TYPES,
  LOAN_TYPE_LABELS,
  SORT_OPTIONS,
  STATUS_LABELS,
} from '../../data/leads'
import type { LeadFilters } from '../../hooks/useLeads'
import styles from './LeadFilterBar.module.css'

const loanTypeOptions = LOAN_TYPES.map((value) => ({
  value,
  label: LOAN_TYPE_LABELS[value],
}))

const statusOptions = LEAD_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}))

const employmentOptions = EMPLOYMENT_TYPES.map((value) => ({
  value,
  label: EMPLOYMENT_LABELS[value],
}))

interface LeadFilterBarProps {
  filters: LeadFilters
  setFilter: <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => void
  onReset: () => void
  hasFilters: boolean
}

/**
 * §8.3 filters. Every control writes straight to the URL through `setFilter`,
 * so the address bar is the state and a filtered view can be shared as a link.
 *
 * Dates are IST calendar days on the server — `from=2026-08-18&to=2026-08-18` is
 * that one Indian day, inclusive at both ends.
 */
export function LeadFilterBar({
  filters,
  setFilter,
  onReset,
  hasFilters,
}: LeadFilterBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.row}>
        <Field label="Search" className={styles.search}>
          {(id) => (
            <TextInput
              id={id}
              type="search"
              placeholder="Name or mobile"
              value={filters.q}
              onChange={(event) => setFilter('q', event.target.value)}
            />
          )}
        </Field>

        <Field label="Loan type" className={styles.control}>
          {(id) => (
            <Select
              id={id}
              placeholder="All types"
              options={loanTypeOptions}
              value={filters.loanType}
              onChange={(event) => setFilter('loanType', event.target.value)}
            />
          )}
        </Field>

        <Field label="Status" className={styles.control}>
          {(id) => (
            <Select
              id={id}
              placeholder="All statuses"
              options={statusOptions}
              value={filters.status}
              onChange={(event) => setFilter('status', event.target.value)}
            />
          )}
        </Field>

        <Field label="Employment" className={styles.control}>
          {(id) => (
            <Select
              id={id}
              placeholder="All"
              options={employmentOptions}
              value={filters.employment}
              onChange={(event) => setFilter('employment', event.target.value)}
            />
          )}
        </Field>
      </div>

      <div className={styles.row}>
        <Field label="From (IST)" className={styles.control}>
          {(id) => (
            <TextInput
              id={id}
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(event) => setFilter('from', event.target.value)}
            />
          )}
        </Field>

        <Field label="To (IST)" className={styles.control}>
          {(id) => (
            <TextInput
              id={id}
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(event) => setFilter('to', event.target.value)}
            />
          )}
        </Field>

        <Field label="Sort" className={styles.control}>
          {(id) => (
            <Select
              id={id}
              options={SORT_OPTIONS}
              value={filters.sort}
              onChange={(event) => setFilter('sort', event.target.value)}
            />
          )}
        </Field>

        <div className={styles.trailing}>
          <Checkbox
            className={styles.suspect}
            checked={filters.includeSuspect}
            onChange={(event) => setFilter('includeSuspect', event.target.checked)}
            label="Include flagged"
          />

          {hasFilters && (
            <button type="button" className={styles.clear} onClick={onReset}>
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
