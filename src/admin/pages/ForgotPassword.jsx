import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, MailCheck, Mountain } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getErrorMessage, logDevError } from '../lib/errors'
import Button from '../../components/ui/Button'

const fieldClasses =
  'w-full rounded-2xl border border-navy/12 bg-snow px-5 py-3.5 text-sm text-navy placeholder:text-slate/50 transition-colors duration-300 focus:border-lake focus:outline-none'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    })

    setSubmitting(false)

    if (resetError) {
      // Supabase never errors here just because the email isn't registered —
      // only for malformed input or rate limiting — so this branch alone
      // can't be used to probe which emails have accounts.
      logDevError('ForgotPassword resetPasswordForEmail', resetError)
      setError(getErrorMessage(resetError, 'Something went wrong. Please try again.'))
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cloud px-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-navy/8 bg-snow p-8 text-center shadow-soft">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lake-50 text-lake">
              <MailCheck size={22} strokeWidth={1.75} />
            </span>
            <h1 className="font-display text-xl font-bold text-navy">Check your email</h1>
            <p className="text-sm leading-relaxed text-slate">
              If an account exists for <span className="font-medium text-navy">{email}</span>, a password reset
              link is on its way. It expires soon, so use it before requesting another.
            </p>
            <Button as={Link} to="/admin/login" variant="secondary" className="mt-2 w-full justify-center">
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-turquoise">
            <Mountain size={22} strokeWidth={1.75} />
          </span>
          <h1 className="font-display text-xl font-bold text-navy">Reset Password</h1>
          <p className="text-sm text-slate">We&rsquo;ll email you a link to choose a new one.</p>
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

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" variant="primary" icon={Mail} disabled={submitting} className="mt-2 justify-center">
            {submitting ? 'Sending…' : 'Send Reset Link'}
          </Button>

          <Link
            to="/admin/login"
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate hover:text-lake"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
