import { Router } from 'express'
import { contactRateLimiter } from '../middleware/contactRateLimiter.js'
import { validateContactForm } from '../utils/validateContactForm.js'
import { sanitizeField } from '../utils/sanitize.js'
import { sendContactEmail } from '../services/emailService.js'

const router = Router()

router.post('/', contactRateLimiter, async (req, res) => {
  const { name, email, subject, message, honeypot } = req.body ?? {}

  // Honeypot: a real visitor never sees or fills this field. A bot that fills
  // every input will trip it. Respond as if it succeeded so the bot doesn't
  // learn to look for a different tell, but skip sending the email entirely.
  if (honeypot) {
    console.warn('Contact form: honeypot field was filled — discarding as spam.')
    return res.status(200).json({ success: true, message: 'Message sent successfully.' })
  }

  const { valid, errors } = validateContactForm({ name, email, subject, message })
  if (!valid) {
    return res.status(400).json({ success: false, message: 'Please fix the errors below.', errors })
  }

  const clean = {
    name: sanitizeField(name),
    email: sanitizeField(email),
    subject: sanitizeField(subject),
    message: String(message).trim(),
  }

  try {
    await sendContactEmail(clean)
    return res.status(200).json({ success: true, message: 'Message sent successfully.' })
  } catch (err) {
    console.error('Contact form: failed to send email:', err)
    return res.status(500).json({
      success: false,
      message: 'Could not send your message right now. Please try again later.',
    })
  }
})

export default router
