import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { getJson, postJson, setUnauthorizedHandler } from '../../lib/api'
import { AuthContext } from '../../hooks/useAuth'
import type { AuthStatus, AuthUser } from '../../hooks/useAuth'

interface MeResponse {
  user: AuthUser
}

/** Owns the session. Everything below it reads state through `useAuth()`. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('checking')

  /* `setUnauthorizedHandler` is a module-level slot, so the effect below must
     not re-register on every render — the ref keeps the callback stable. */
  const clearSession = useRef(() => {
    setUser(null)
    setStatus('anonymous')
  })

  useEffect(() => {
    const handler = () => clearSession.current()
    setUnauthorizedHandler(handler)
    return () => setUnauthorizedHandler(null)
  }, [])

  // §12 — on load, ask the server who we are. A 401 here is the normal
  // "not signed in" case, so it must not trigger the global redirect.
  useEffect(() => {
    let cancelled = false

    getJson<MeResponse>('/api/auth/me', { skipAuthRedirect: true })
      .then((data) => {
        if (cancelled) return
        setUser(data.user)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        setUser(null)
        setStatus('anonymous')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    // A 401 here means wrong password — shown on the form, never a redirect.
    const data = await postJson<MeResponse>(
      '/api/auth/login',
      { email, password },
      { skipAuthRedirect: true },
    )
    setUser(data.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await postJson('/api/auth/logout')
    } finally {
      // Whatever the server said, this browser is done with the session.
      setUser(null)
      setStatus('anonymous')
    }
  }, [])

  const value = useMemo(
    () => ({ user, status, login, logout }),
    [user, status, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
