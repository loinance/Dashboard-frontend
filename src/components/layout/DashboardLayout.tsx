import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { SmartLink } from '../ui/SmartLink'
import { useAuth } from '../../hooks/useAuth'
import styles from './DashboardLayout.module.css'

/**
 * Chrome for the staff dashboard.
 *
 * Deliberately not `RootLayout`: the marketing header, announcement bar and
 * footer are for visitors, and an internal tool that wears them invites someone
 * to click "Apply now" out of their own admin screen.
 */
export function DashboardLayout() {
  const { user, status, logout } = useAuth()
  const location = useLocation()

  // Nothing is known yet on a hard refresh. Rendering either the dashboard or a
  // redirect here would flash the wrong thing for one frame.
  if (status === 'checking') {
    return (
      <div className={styles.gate} role="status" aria-live="polite">
        <span className={styles.gateText}>Checking your session…</span>
      </div>
    )
  }

  if (status === 'anonymous') {
    // `state.from` so login can send them back where they were headed.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <SmartLink href="/leads" className={styles.brand} aria-label="Leads dashboard">
          <Logo className={styles.logo} />
          <span className={styles.badge}>Staff</span>
        </SmartLink>

        <div className={styles.account}>
          <span className={styles.user}>
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.userRole}>{user?.role}</span>
          </span>
          <button type="button" className={styles.signOut} onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
