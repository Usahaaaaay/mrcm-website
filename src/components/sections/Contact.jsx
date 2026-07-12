import { useState } from 'react'
import { Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { socialLinks } from '../../data/social'
import { API_BASE_URL } from '../../lib/api'
import Reveal from '../ui/Reveal'
import Button from '../ui/Button'
import SectionTitle from '../ui/SectionTitle'

const fieldClasses =
  'w-full rounded-2xl border border-navy/12 bg-snow px-5 py-3.5 text-sm text-navy placeholder:text-slate/50 transition-colors duration-300 focus:border-lake focus:outline-none'

// honeypot is never shown to real visitors — a filled-in value means a bot.
const initialForm = { name: '', email: '', subject: '', message: '', honeypot: '' }

const GENERIC_ERROR = 'Something went wrong. Please try again in a moment.'

const Contact = () => {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.success) {
        const fieldErrors = data?.errors ? Object.values(data.errors).join(' ') : null
        setErrorMessage(fieldErrors || data?.message || GENERIC_ERROR)
        setStatus('error')
        return
      }

      setStatus('success')
      setForm(initialForm)
    } catch {
      setErrorMessage(GENERIC_ERROR)
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="bg-cloud px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <SectionTitle
          eyebrow="Contact"
          title="Let's talk"
          description="Have a project in mind, a question, or just want to say hello? I'd love to hear from you."
        />

        <Reveal>
          {status === 'success' ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-navy/8 bg-snow p-14 text-center shadow-soft">
              <CheckCircle2 size={40} className="text-lake" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-navy">Message sent</h3>
              <p className="text-sm text-slate">
                Thank you for reaching out — I&rsquo;ll get back to you soon.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="text-sm font-medium text-lake hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 rounded-3xl border border-navy/8 bg-snow p-8 shadow-soft sm:p-10"
            >
              {status === 'error' ? (
                <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              ) : null}

              {/* Honeypot: hidden from real visitors, invisible to screen readers, but
                  present in the DOM/tab order for bots that auto-fill every field. */}
              <input
                type="text"
                name="honeypot"
                value={form.honeypot}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute h-0 w-0 opacity-0"
                style={{ left: '-9999px' }}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-navy">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    disabled={status === 'loading'}
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={fieldClasses}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-navy">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={status === 'loading'}
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={fieldClasses}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="subject" className="text-sm font-medium text-navy">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  disabled={status === 'loading'}
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  className={fieldClasses}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-medium text-navy">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  disabled={status === 'loading'}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell me a little more..."
                  className={`${fieldClasses} resize-none`}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                icon={status === 'loading' ? Loader2 : Send}
                iconClassName={status === 'loading' ? 'animate-spin' : ''}
                disabled={status === 'loading'}
                className="mt-2 self-center px-8 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'loading' ? 'Sending…' : 'Send Message'}
              </Button>
            </form>
          )}
        </Reveal>

        <Reveal delay={0.1} className="mt-12 flex justify-center gap-5">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-navy/10 bg-snow text-slate shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-lake hover:text-lake"
            >
              <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

export default Contact
