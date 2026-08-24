import { Seo } from '../components/seo/Seo'
import { LeadFilterBar } from '../components/dashboard/LeadFilterBar'
import { LeadStats } from '../components/dashboard/LeadStats'
import { LeadsTable } from '../components/dashboard/LeadsTable'
import { useLeads } from '../hooks/useLeads'
import { pageSeo } from '../data/seo'
import styles from './LeadsPage.module.css'

/** §12 — the leads table, filters and export. */
export function LeadsPage() {
  const {
    filters,
    setFilter,
    resetFilters,
    hasFilters,
    result,
    stats,
    loading,
    error,
    exportUrl,
  } = useLeads()

  const total = result?.total ?? 0
  const totalPages = result?.totalPages ?? 1
  const showingFrom = total === 0 ? 0 : (filters.page - 1) * (result?.pageSize ?? 25) + 1
  const showingTo = Math.min(filters.page * (result?.pageSize ?? 25), total)

  return (
    <>
      <Seo {...pageSeo.leads} />

      <div className={styles.page}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>Leads</h1>
            <p className={styles.subtitle}>
              {total === 0
                ? 'No leads match the current filters.'
                : `Showing ${showingFrom.toLocaleString('en-IN')}–${showingTo.toLocaleString('en-IN')} of ${total.toLocaleString('en-IN')}`}
            </p>
          </div>

          {/* A plain link, not a fetch: a top-level navigation carries the
              session cookie and lets the browser save the file (§12). */}
          <a
            className={styles.export}
            href={exportUrl}
            /* Same-origin in dev via the Vite proxy, so no `download` attribute —
               the server's Content-Disposition names the file. */
          >
            Export to Excel
          </a>
        </header>

        <LeadStats stats={stats} />

        <LeadFilterBar
          filters={filters}
          setFilter={setFilter}
          onReset={resetFilters}
          hasFilters={hasFilters}
        />

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : (
          <LeadsTable leads={result?.data ?? []} loading={loading} />
        )}

        {totalPages > 1 && (
          <nav className={styles.pager} aria-label="Pagination">
            <button
              type="button"
              className={styles.pageButton}
              disabled={filters.page <= 1}
              onClick={() => setFilter('page', filters.page - 1)}
            >
              Previous
            </button>

            <span className={styles.pageCount}>
              Page {filters.page} of {totalPages}
            </span>

            <button
              type="button"
              className={styles.pageButton}
              disabled={filters.page >= totalPages}
              onClick={() => setFilter('page', filters.page + 1)}
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </>
  )
}
