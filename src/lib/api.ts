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
}

async function request<T>(
  path: string,
  init: RequestInit,
  options: RequestOptions = {},
): Promise<T> {
  let response: Response

  try {
    response = await fetch(apiUrl(path), {
      // `credentials: 'include'` on every call — §12. There is no token to
      // attach; the HttpOnly cookie does the work, and it only travels if we
      // ask for it.
      credentials: 'include',
      ...init,
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

    if (response.status === 401 && !options.skipAuthRedirect) onUnauthorized?.()

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

/** `{ a: 1, b: undefined }` → `"a=1"`. Empty values are dropped, not sent blank. */
export function queryString(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '' || value === false) continue
    search.set(key, String(value))
  }
  return search.toString()
}
