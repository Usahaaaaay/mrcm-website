import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LogIn, Mountain } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Button from '../../components/ui/Button'

const fieldClasses =
  'w-full rounded-2xl border border-navy/12 bg-snow px-5 py-3.5 text-sm text-navy placeholder:text-slate/50 transition-colors duration-300 focus:border-lake focus:outline-none'

const Login = () => {
  const { session, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (session) {
    return <Navigate to={location.state?.from?.pathname ?? '/admin'} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: signInError } = await signIn(email, password)
    setSubmitting(false)

    if (signInError) {
      setError('Invalid email or password.')
      return
    }
    navigate(location.state?.from?.pathname ?? '/admin', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-turquoise">
            <Mountain size={22} strokeWidth={1.75} />
          </span>
          <h1 className="font-display text-xl font-bold text-navy">Admin Sign In</h1>
          <p className="text-sm text-slate">MRCMalubay content dashboard</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-3xl border border-navy/8 bg-snow p-8 shadow-soft"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-navy">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClasses}
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-navy">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClasses}
              placeholder="••••••••"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" variant="primary" icon={LogIn} disabled={submitting} className="mt-2 justify-center">
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Login
