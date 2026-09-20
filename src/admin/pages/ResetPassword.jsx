import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, KeyRound, Mountain, ShieldAlert } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getErrorMessage, logDevError } from '../lib/errors'
import Button from '../../components/ui/Button'

const fieldClasses =
  'w-full rounded-2xl border border-navy/12 bg-snow px-5 py-3.5 text-sm text-navy placeholder:text-slate/50 transition-colors duration-300 focus:border-lake focus:outline-none'

const MIN_PASSWORD_LENGTH = 8
// How long to wait for Supabase to fire PASSWORD_RECOVERY before treating the
// link as invalid — covers a straight visit to this URL with no token at all.
const RECOVERY_TIMEOUT_MS = 4000

const Shell = ({ children }) => (
  <div className="flex min-h-screen items-center justify-center bg-cloud px-6">
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-turquoise">
          <Mountain size={22} strokeWidth={1.75} />
        </span>
        <h1 className="font-display text-xl font-bold text-navy">Set a New Password</h1>
      </div>
      {children}
    </div>
  </div>
)

const ResetPassword = () => {
  const navigate = useNavigate()
  // 'checking' | 'ready' | 'invalid' | 'done'
  const [status, setStatus] = useState('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // A failed/expired link redirects here with Supabase's own error
    // params instead of a token — surface that immediately rather than
    // waiting out the timeout below.
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const queryParams = new URLSearchParams(window.location.search)
    const errorDescription = hashParams.get('error_description') || queryParams.get('error_description')
    if (errorDescription) {
      setStatus('invalid')
      return
    }

    // Supabase parses the recovery token out of the URL on load and fires
    // this event once it establishes the temporary recovery session — that,
    // not a normal signed-in session, is what actually proves the link is
    // valid.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStatus('ready')
    })

    const timeout = setTimeout(() => {
      setStatus((current) => (current === 'checking' ? 'invalid' : current))
    }, RECOVERY_TIMEOUT_MS)

    return () => {
      listener.subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      logDevError('ResetPassword updateUser', updateError)
      setSubmitting(false)
      setError(getErrorMessage(updateError, 'Could not update your password. Please try again.'))
      return
    }

    // The recovery token is single-purpose — sign out of it and send the
    // user back through a normal sign-in with the new password, rather than
    // leaving them signed in on a short-lived recovery session.
    await supabase.auth.signOut()
    setSubmitting(false)
    setStatus('done')
  }

  if (status === 'checking') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-navy/8 bg-snow p-8 text-center shadow-soft">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-lake/30 border-t-lake" />
          <p className="text-sm text-slate">Checking your reset link…</p>
        </div>
      </Shell>
    )
  }

  if (status === 'invalid') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-navy/8 bg-snow p-8 text-center shadow-soft">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldAlert size={22} strokeWidth={1.75} />
          </span>
          <h2 className="text-base font-semibold text-navy">This link is invalid or expired</h2>
          <p className="text-sm leading-relaxed text-slate">
            Password reset links only work once and don&rsquo;t stay valid for long. Request a new one to continue.
          </p>
          <Button as={Link} to="/admin/forgot-password" variant="primary" className="mt-2 w-full justify-center">
            Request a New Link
          </Button>
        </div>
      </Shell>
    )
  }

  if (status === 'done') {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-navy/8 bg-snow p-8 text-center shadow-soft">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lake-50 text-lake">
            <CheckCircle2 size={22} strokeWidth={1.75} />
          </span>
          <h2 className="text-base font-semibold text-navy">Password updated</h2>
          <p className="text-sm leading-relaxed text-slate">Sign in with your new password to continue.</p>
          <Button
            variant="primary"
            className="mt-2 w-full justify-center"
            onClick={() => navigate('/admin/login', { replace: true })}
          >
            Continue to Sign In
          </Button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-3xl border border-navy/8 bg-snow p-8 shadow-soft"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="new-password" className="text-sm font-medium text-navy">
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            required
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClasses}
            placeholder="••••••••"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirm-password" className="text-sm font-medium text-navy">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={fieldClasses}
            placeholder="••••••••"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Button type="submit" variant="primary" icon={KeyRound} disabled={submitting} className="mt-2 justify-center">
          {submitting ? 'Updating…' : 'Update Password'}
        </Button>
      </form>
    </Shell>
  )
}

export default ResetPassword
