import { createContext, useContext } from 'react'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

/**
 * `checking` is the state that matters: on a hard refresh we do not yet know
 * whether the cookie is valid, and rendering either the dashboard or the login
 * form during that window would be a visible flash of the wrong thing.
 */
export type AuthStatus = 'checking' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

/* Context and hook live apart from the provider component so that the module
   exporting <AuthProvider> exports only components — otherwise Vite's fast
   refresh gives up on the whole file. */
export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
