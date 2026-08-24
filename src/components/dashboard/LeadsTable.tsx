import { Link } from 'react-router-dom'
import { cx } from '../../lib/cx'
import { formatRupees } from '../../lib/format'
import { formatIstDateTime } from '../../lib/datetime'
import {
  EMPLOYMENT_LABELS,
  LOAN_TYPE_LABELS,
  RISK_FLAG_LABELS,
  STATUS_LABELS,
  STATUS_TONE,
} from '../../data/leads'
import type { LeadSummary } from '../../data/leads'
import styles from './LeadsTable.module.css'

interface LeadsTableProps {
  leads: LeadSummary[]
  loading: boolean
}

export function LeadsTable({ leads, loading }: LeadsTableProps) {
  if (!loading && leads.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No leads match these filters.</p>
        <p className={styles.emptyHint}>
          Flagged leads are hidden unless you tick <strong>Include flagged</strong>.
        </p>
      </div>
    )
  }

  return (
    /* The wrapper scrolls, not the page — a wide table must never make the
       whole dashboard scroll sideways. */
    <div className={styles.scroller}>
      <table className={cx(styles.table, loading && styles.loading)}>
        <thead>
          <tr>
            <th scope="col">Received</th>
            <th scope="col">Name</th>
            <th scope="col">Mobile</th>
            <th scope="col">Loan</th>
            <th scope="col" className={styles.numeric}>
              Amount
            </th>
            <th scope="col" className={styles.numeric}>
              Income
            </th>
            <th scope="col">Employment</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className={styles.when}>
                <Link to={`/leads/${lead.id}`} className={styles.rowLink}>
                  {formatIstDateTime(lead.createdAt)}
                </Link>
              </td>
              <td>
                <Link to={`/leads/${lead.id}`} className={styles.name}>
                  {lead.fullName}
                </Link>
                {lead.isSuspect && (
                  <span
                    className={styles.flag}
                    title={
                      lead.riskFlags
                        .map((flag) => RISK_FLAG_LABELS[flag] ?? flag)
                        .join('\n') || 'Flagged for review'
                    }
                  >
                    Flagged
                  </span>
                )}
              </td>
              <td>
                {/* A mobile in a leads table exists to be called. */}
                <a className={styles.mobile} href={`tel:+91${lead.mobile}`}>
                  {lead.mobile}
                </a>
              </td>
              <td>{LOAN_TYPE_LABELS[lead.loanType] ?? lead.loanType}</td>
              <td className={styles.numeric}>{formatRupees(lead.amount)}</td>
              <td className={styles.numeric}>{formatRupees(lead.income)}</td>
              <td>{EMPLOYMENT_LABELS[lead.employment] ?? lead.employment}</td>
              <td>
                <span className={cx(styles.status, styles[STATUS_TONE[lead.status]])}>
                  {STATUS_LABELS[lead.status] ?? lead.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
