import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import contactRouter from './routes/contact.js'

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

if (allowedOrigins.length === 0) {
  console.warn('CLIENT_ORIGIN is not set — allowing requests from any origin. Set it in production.')
}

app.use(cors({ origin: allowedOrigins.length > 0 ? allowedOrigins : '*' }))
app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/contact', contactRouter)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found.' })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' })
})

app.listen(PORT, () => {
  console.log(`Contact API listening on port ${PORT}`)
})
