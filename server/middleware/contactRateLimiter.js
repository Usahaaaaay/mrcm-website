import rateLimit from 'express-rate-limit'

// Simple per-IP limit on the contact endpoint: 5 submissions per 15 minutes.
export const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many messages sent from this device. Please try again later.',
  },
})
