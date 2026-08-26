import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ApiRequestError, downloadFile, getJson, queryString } from '../lib/api'
import type { LeadListResponse, LeadStats } from '../data/leads'

/**
 * The filter set, held in the URL rather than in component state.
 *
 * That makes a filtered view shareable and survivable across a refresh — an
 * advisor can send "the home loans from last week" as a link — and it means the
 * export request is built from the same params the table is showing.
 */
export interface LeadFilters {
  q: string
  loanType: string
  status: string
  employment: string
  from: string
  to: string
  includeSuspect: boolean
  sort: string
  page: number
}

export const emptyFilters: LeadFilters = {
  q: '',
  loanType: '',
  status: '',
  employment: '',
  from: '',
  to: '',
  includeSuspect: false,
  sort: 'created_at:desc',
  page: 1,
}

const PAGE_SIZE = 25

function readFilters(params: URLSearchParams): LeadFilters {
  return {
    q: params.get('q') ?? '',
    loanType: params.get('loanType') ?? '',
    status: params.get('status') ?? '',
    employment: params.get('employment') ?? '',
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
    includeSuspect: params.get('includeSuspect') === '1',
    sort: params.get('sort') ?? 'created_at:desc',
    page: Math.max(1, Number(params.get('page')) || 1),
  }
}

/** Only non-default values reach the URL, so a clean view has a clean address. */
function writeFilters(filters: LeadFilters): Record<string, string> {
  const out: Record<string, string> = {}
  if (filters.q) out.q = filters.q
  if (filters.loanType) out.loanType = filters.loanType
  if (filters.status) out.status = filters.status
  if (filters.employment) out.employment = filters.employment
  if (filters.from) out.from = filters.from
  if (filters.to) out.to = filters.to
  if (filters.includeSuspect) out.includeSuspect = '1'
  if (filters.sort !== 'created_at:desc') out.sort = filters.sort
  if (filters.page > 1) out.page = String(filters.page)
  return out
}

/** The query the API sees. Shared by the table, the stats and the export link. */
function apiQuery(filters: LeadFilters, extra: Record<string, string> = {}): string {
  return queryString({
    q: filters.q || undefined,
    loanType: filters.loanType || undefined,
    status: filters.status || undefined,
    employment: filters.employment || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    includeSuspect: filters.includeSuspect ? '1' : undefined,
    sort: filters.sort,
    page: filters.page,
    pageSize: PAGE_SIZE,
    ...extra,
  })
}

export function useLeads() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = readFilters(searchParams)

  const [result, setResult] = useState<LeadListResponse | null>(null)
  const [stats, setStats] = useState<LeadStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const query = apiQuery(filters)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      getJson<LeadListResponse>(`/api/admin/leads?${query}`),
      getJson<LeadStats>(`/api/admin/leads/stats?${query}`),
    ])
      .then(([list, counts]) => {
        if (cancelled) return
        setResult(list)
        setStats(counts)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        // A 401 has already sent us to /login; don't also paint an error.
        if (err instanceof ApiRequestError && err.status === 401) return
        setError(
          err instanceof ApiRequestError
            ? err.message
            : 'Could not load leads. Please try again.',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [query])

  /** Any filter change resets to page 1 — page 4 of a new filter is meaningless. */
  const setFilter = useCallback(
    <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => {
      const next = { ...readFilters(searchParams), [key]: value }
      if (key !== 'page') next.page = 1
      setSearchParams(writeFilters(next), { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const resetFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  /* Fetched rather than linked: a top-level navigation carries no
     `Authorization` header, so on a browser using the Bearer fallback the link
     would download the API's 401 instead of the file. */
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const exportLeads = useCallback(async () => {
    setExporting(true)
    setExportError(null)
    try {
      await downloadFile(`/api/admin/leads/export?${apiQuery(filters)}`, 'leads.csv')
    } catch (err) {
      setExportError(
        err instanceof ApiRequestError
          ? err.message
          : "We couldn't prepare that download. Please try again.",
      )
    } finally {
      setExporting(false)
    }
  }, [filters])

  const hasFilters = Object.keys(writeFilters(filters)).some((key) => key !== 'page')

  return {
    filters,
    setFilter,
    resetFilters,
    hasFilters,
    result,
    stats,
    loading,
    error,
    exportLeads,
    exporting,
    exportError,
    pageSize: PAGE_SIZE,
  }
}
