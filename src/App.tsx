import { Route, Routes } from 'react-router-dom'
import { RootLayout } from './components/layout/RootLayout'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { AuthProvider } from './components/auth/AuthProvider'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { LoginPage } from './pages/LoginPage'
import { LeadsPage } from './pages/LeadsPage'
import { LeadDetailPage } from './pages/LeadDetailPage'
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage'
import { TermsOfUsePage } from './pages/legal/TermsOfUsePage'
import { GrievancePage } from './pages/legal/GrievancePage'

/**
 * Two route families under one provider.
 *
 * `RootLayout` is the public marketing site; `DashboardLayout` is the staff
 * tool and doubles as the auth guard, so nothing under `/leads` renders without
 * a valid session. `AuthProvider` wraps both because `/login` needs it too.
 */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsOfUsePage />} />
          <Route path="grievance" element={<GrievancePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="login" element={<LoginPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
