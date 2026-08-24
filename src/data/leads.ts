/**
 * The lead vocabulary, mirroring `dashboard-api/src/modules/leads/constants.ts`.
 *
 * These slugs are a wire contract — the API validates against exactly these
 * strings. The labels are display-only and safe to reword; the slugs are not.
 */

export const LOAN_TYPES = [
  'personal',
  'home',
  'mortgage',
  'car',
  'business',
  'credit-card',
] as const
export type LoanType = (typeof LOAN_TYPES)[number]

export const LEAD_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'sent_to_bank',
  'disbursed',
  'rejected',
  'junk',
] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const EMPLOYMENT_TYPES = ['salaried', 'self-employed', 'business-owner'] as const
export type Employment = (typeof EMPLOYMENT_TYPES)[number]

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  personal: 'Personal loan',
  home: 'Home loan',
  mortgage: 'Mortgage',
  car: 'Car loan',
  business: 'Business loan',
  'credit-card': 'Credit card',
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  sent_to_bank: 'Sent to bank',
  disbursed: 'Disbursed',
  rejected: 'Rejected',
  junk: 'Junk',
}

export const EMPLOYMENT_LABELS: Record<Employment, string> = {
  salaried: 'Salaried',
  'self-employed': 'Self-employed',
  'business-owner': 'Business owner',
}

/** Why a lead was flagged (§5.4). Shown on hover so a badge is never a mystery. */
export const RISK_FLAG_LABELS: Record<string, string> = {
  repeated_digits: 'Mobile looks like a pattern (e.g. 9999999999)',
  datacenter_ip: 'Submitted from a hosting or VPN address',
  foreign_ip: 'Submitted from outside India — NRIs and VPN users are real customers',
  income_implausible: 'Income or loan-to-income ratio looks implausible',
  burst_ip: 'Another lead came from this address within the hour',
  no_referer: 'Posted with no referrer — typical of a script',
}

/** Status colour families. Keys map to class names in LeadsTable.module.css. */
export const STATUS_TONE: Record<LeadStatus, 'neutral' | 'progress' | 'good' | 'bad'> = {
  new: 'neutral',
  contacted: 'progress',
  qualified: 'progress',
  sent_to_bank: 'progress',
  disbursed: 'good',
  rejected: 'bad',
  junk: 'bad',
}

/* ── API shapes (§8.3) ──────────────────────────────────────────────────── */

/** `view=summary` — what the table renders. */
export interface LeadSummary {
  id: string
  createdAt: string
  fullName: string
  mobile: string
  loanType: LoanType
  amount: number
  income: number
  employment: Employment
  status: LeadStatus
  isSuspect: boolean
  riskFlags: string[]
  source: string
}

/** `view=full` and `GET /leads/:id` — every column. */
export interface LeadFull extends LeadSummary {
  updatedAt: string
  consentAt: string
  consentText: string
  consentVersion: string
  ip: string | null
  userAgent: string | null
  referer: string | null
  pageUrl: string | null
  utm: Record<string, string> | null
  notes: string | null
  ownerId: string | null
  firstCallAt: string | null
}

export interface LeadListResponse {
  data: LeadSummary[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface LeadStats {
  total: number
  today: number
  thisWeek: number
  thisMonth: number
  suspect: number
  byStatus: Record<string, number>
  byLoanType: Record<string, number>
}

export const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Newest first' },
  { value: 'created_at:asc', label: 'Oldest first' },
  { value: 'amount:desc', label: 'Largest amount' },
] as const
export type SortValue = (typeof SORT_OPTIONS)[number]['value']
