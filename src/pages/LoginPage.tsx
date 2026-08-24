import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Field, TextInput } from '../components/ui/Field'
import { Logo } from '../components/layout/Logo'
import { Seo } from '../components/seo/Seo'
import { useAuth } from '../hooks/useAuth'
import { ApiRequestError } from '../lib/api'
import { pageSeo } from '../data/seo'
import styles from './LoginPage.module.css'

interface LocationState {
  from?: string
}

/** §12 — the only auth surface. There is no public signup. */
export function LoginPage() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Where they were headed before the guard bounced them here.
  const destination = (location.state as LocationState | null)?.from ?? '/leads'

  useEffect(() => {
    document.title = pageSeo.login.title
  }, [])

  // Already signed in — no reason to show the form.
  if (status === 'authenticated') return <Navigate to={destination} replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    try {
      await login(email, password)
      navigate(destination, { replace: true })
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
        setFieldErrors(err.fields)
      } else {
        setError('Something went wrong. Please try again.')
      }
      setSubmitting(false)
    }
  }

  return (
    <>
      <Seo {...pageSeo.login} />

      <div className={styles.page}>
        <div className={styles.panel}>
          <Logo className={styles.logo} />

          <div className={styles.head}>
            <h1 className={styles.title}>Staff sign in</h1>
            <p className={styles.subtitle}>
              Loinance leads dashboard. Accounts are created by an admin — there is
              no signup.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Field label="Email" error={fieldErrors.email}>
              {(id) => (
                <TextInput
                  id={id}
                  type="email"
                  autoComplete="username"
                  autoFocus
                  placeholder="you@loinance.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              )}
            </Field>

            <Field label="Password" error={fieldErrors.password}>
              {(id) => (
                <TextInput
                  id={id}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              )}
            </Field>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="green"
              size="block"
              disabled={submitting || !email || !password}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
