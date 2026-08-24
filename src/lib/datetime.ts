/**
 * Dates for the dashboard.
 *
 * The API sends UTC ISO 8601 (`2026-08-24T18:41:45.000Z`) but the business runs
 * on IST, and the server's own date filters are IST calendar days. Formatting in
 * the viewer's local zone would put a 00:30 IST lead on the previous day for
 * anyone travelling — so the zone is pinned, not inferred.
 */

const IST = 'Asia/Kolkata'

const dateTime = new Intl.DateTimeFormat('en-IN', {
  timeZone: IST,
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
})

const dateOnly = new Intl.DateTimeFormat('en-IN', {
  timeZone: IST,
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

/** `2026-08-24T18:41:45Z` → `25 Aug 2026, 12:11 am` (IST). */
export function formatIstDateTime(iso: string | null | undefined): string {
  const date = parse(iso)
  return date ? dateTime.format(date) : '—'
}

/** `2026-08-24T18:41:45Z` → `25 Aug 2026` (IST). */
export function formatIstDate(iso: string | null | undefined): string {
  const date = parse(iso)
  return date ? dateOnly.format(date) : '—'
}

/** `YYYY-MM-DD` for today in IST — the value the date inputs and API expect. */
export function istToday(): string {
  // en-CA gives ISO-ordered parts, which is exactly the input format.
  return new Intl.DateTimeFormat('en-CA', { timeZone: IST }).format(new Date())
}
