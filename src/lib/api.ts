/**
 * The single path to the backend.
 *
 * `VITE_API_BASE_URL` is empty in development — the Vite proxy forwards
 * `/api/*` to the API on :8080, so the browser stays same-origin and the
 * session cookie behaves exactly as it will in production behind one domain.
 * Set it only when the API lives on a different origin.
 */
const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

export const apiUrl = (path: string): string => `${BASE}${path}`

/** §10 — the one error shape the whole API speaks. */
export interface ApiErrorBody {
  ok: false
  error: {
    code: string
    message: string
    fields?: Record<string, string>
  }
}

/** A failed request, carrying the server's user-safe message and field errors. */
export class ApiRequestError extends Error {
  readonly status: number
  readonly code: string
  readonly fields: Record<string, string>

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
    this.fields = fields ?? {}
  }
}

const NETWORK_MESSAGE =
  "We couldn't reach our servers. Please check your connection and try again."

/* ── session token ──────────────────────────────────────────────────────── */

const TOKEN_KEY = 'loinance.session'

/**
 * The session cookie stays the primary carrier, and in a same-origin deployment
 * it is the only one that matters. But the API is on `*.up.railway.app` while
 * the dashboard is on the site's own domain, which makes the cookie third-party:
 * Safari and Brave drop it unconditionally, Chrome drops it in incognito, and a
 * `SameSite` mismatch drops it everywhere. `POST /api/auth/login` therefore also
 * returns the JWT, and every later call sends it as `Authorization: Bearer`.
 *
 * The trade is that this copy is readable by script, unlike the HttpOnly cookie.
 * Moving the API onto `api.loinance.com` would make the cookie first-party again
 * and let this be deleted.
 */
export function setAuthToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Private mode with storage disabled — the cookie is still in play.
  }
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/** `{ Authorization }` when a token is stored, `{}` otherwise. */
function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/* ── session expiry ─────────────────────────────────────────────────────── */

type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler | null = null

/**
 * §12 — a `401` from any call clears local state and sends the user to `/login`.
 *
 * Registered once by `AuthProvider`. Keeping it here means every caller gets the
 * behaviour without remembering to ask for it: a session that expired mid-session
 * should not surface as a broken table.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler
}

interface RequestOptions {
  /**
   * Skip the global `401` redirect. Set on the login call, where a `401` means
   * "wrong password" and must be shown on the form, not treated as an expiry.
   */
  skipAuthRedirect?: boolean
  /** Keep any stored token on a `401`. Set on login, which has none to lose. */
  keepToken?: boolean
}

async function request<T>(
  path: string,
  init: RequestInit,
  options: RequestOptions = {},
): Promise<T> {
  let response: Response

  try {
    response = await fetch(apiUrl(path), {
      // `credentials: 'include'` on every call — §12. The HttpOnly cookie does
      // the work wherever the browser will send it, and it only travels if we
      // ask for it. The Bearer header covers the browsers that will not.
      credentials: 'include',
      ...init,
      headers: { ...authHeaders(), ...init.headers },
    })
  } catch {
    // DNS failure, offline, CORS preflight rejected — never a server message.
    throw new ApiRequestError(0, 'NETWORK', NETWORK_MESSAGE)
  }

  // 204 No Content — logout. There is no body to parse.
  const payload: unknown =
    response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    const error =
      payload && typeof payload === 'object' && 'error' in payload
        ? (payload as ApiErrorBody).error
        : undefined

    if (response.status === 401) {
      // Whatever the redirect policy, a rejected token is not worth keeping —
      // the login call is exempt, since it never had one to invalidate.
      if (!options.keepToken) setAuthToken(null)
      if (!options.skipAuthRedirect) onUnauthorized?.()
    }

    throw new ApiRequestError(
      response.status,
      error?.code ?? 'INTERNAL',
      error?.message ?? 'Something went wrong. Please try again.',
      error?.fields,
    )
  }

  return payload as T
}

export function getJson<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, { method: 'GET' }, options)
}

export function postJson<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return request<T>(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    },
    options,
  )
}

export function patchJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** `Content-Disposition: attachment; filename="leads.csv"` → `leads.csv`. */
function filenameFrom(header: string | null, fallback: string): string {
  if (!header) return fallback
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header)
  return match?.[1] ? decodeURIComponent(match[1]) : fallback
}

/**
 * Downloads a file through `fetch` rather than a top-level navigation.
 *
 * The export used to be a plain `<a href>` so the browser would attach the
 * session cookie itself. A navigation carries no `Authorization` header, so on
 * any browser relying on the Bearer fallback that link downloads the API's 401
 * JSON instead of the spreadsheet. Fetching it and saving the blob keeps one
 * code path for both carriers.
 */
export async function downloadFile(path: string, fallbackName: string): Promise<void> {
  let response: Response

  try {
    response = await fetch(apiUrl(path), {
      credentials: 'include',
      headers: authHeaders(),
    })
  } catch {
    throw new ApiRequestError(0, 'NETWORK', NETWORK_MESSAGE)
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiErrorBody | null

    if (response.status === 401) {
      setAuthToken(null)
      onUnauthorized?.()
    }

    throw new ApiRequestError(
      response.status,
      payload?.error?.code ?? 'INTERNAL',
      payload?.error?.message ?? "We couldn't prepare that download. Please try again.",
    )
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filenameFrom(response.headers.get('Content-Disposition'), fallbackName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Revoking synchronously can cancel the save in Safari; one tick is enough.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** `{ a: 1, b: undefined }` → `"a=1"`. Empty values are dropped, not sent blank. */
export function queryString(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '' || value === false) continue
    search.set(key, String(value))
  }
  return search.toString()
}
