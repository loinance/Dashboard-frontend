import { Route, Routes } from 'react-router-dom'
import { RootLayout } from './components/layout/RootLayout'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage'
import { TermsOfUsePage } from './pages/legal/TermsOfUsePage'
import { GrievancePage } from './pages/legal/GrievancePage'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="privacy" element={<PrivacyPolicyPage />} />
        <Route path="terms" element={<TermsOfUsePage />} />
        <Route path="grievance" element={<GrievancePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
