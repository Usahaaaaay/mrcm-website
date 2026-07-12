import validator from 'validator'

const LIMITS = { name: 100, subject: 150, message: 5000 }

export function validateContactForm({ name, email, subject, message }) {
  const errors = {}

  if (!name || !String(name).trim()) {
    errors.name = 'Name is required.'
  } else if (String(name).trim().length > LIMITS.name) {
    errors.name = `Name must be ${LIMITS.name} characters or fewer.`
  }

  if (!email || !String(email).trim()) {
    errors.email = 'Email is required.'
  } else if (!validator.isEmail(String(email).trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!subject || !String(subject).trim()) {
    errors.subject = 'Subject is required.'
  } else if (String(subject).trim().length > LIMITS.subject) {
    errors.subject = `Subject must be ${LIMITS.subject} characters or fewer.`
  }

  if (!message || !String(message).trim()) {
    errors.message = 'Message is required.'
  } else if (String(message).trim().length > LIMITS.message) {
    errors.message = `Message must be ${LIMITS.message} characters or fewer.`
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
