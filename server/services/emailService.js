import nodemailer from 'nodemailer'
import { escapeHtml } from '../utils/sanitize.js'

let transporter = null

// Created lazily (not at import time) so a missing/invalid EMAIL_USER/EMAIL_PASS
// surfaces as a clear error when a message is actually sent, not as a crash on boot.
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }
  return transporter
}

function buildTextBody({ name, email, subject, message }) {
  return [
    'Name:',
    name,
    '',
    'Email:',
    email,
    '',
    'Subject:',
    subject,
    '',
    'Message:',
    message,
  ].join('\n')
}

function buildHtmlBody({ name, email, subject, message }) {
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    subject: escapeHtml(subject),
    message: escapeHtml(message).replace(/\n/g, '<br />'),
  }

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1a2b3c;">
      <h2 style="color: #0f2942; margin-bottom: 20px;">New Portfolio Contact</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 12px 8px 0; font-weight: 600; vertical-align: top; width: 90px;">Name</td>
          <td style="padding: 8px 0;">${safe.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px 8px 0; font-weight: 600; vertical-align: top;">Email</td>
          <td style="padding: 8px 0;">${safe.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px 8px 0; font-weight: 600; vertical-align: top;">Subject</td>
          <td style="padding: 8px 0;">${safe.subject}</td>
        </tr>
      </table>
      <p style="font-weight: 600; margin-top: 24px; margin-bottom: 8px;">Message</p>
      <p style="white-space: pre-wrap; line-height: 1.6; margin: 0;">${safe.message}</p>
    </div>
  `
}

/**
 * Sends a contact-form notification email via Gmail SMTP.
 * `to` receives the message; `email` (the visitor's address) is set as
 * replyTo so replying goes straight back to them.
 */
export async function sendContactEmail({ name, email, subject, message }) {
  const mailer = getTransporter()
  const receiver = process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USER

  await mailer.sendMail({
    from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
    to: receiver,
    replyTo: email,
    subject: `New Portfolio Contact - ${subject}`,
    text: buildTextBody({ name, email, subject, message }),
    html: buildHtmlBody({ name, email, subject, message }),
  })
}
