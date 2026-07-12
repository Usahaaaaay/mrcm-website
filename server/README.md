# Contact API

Express backend for the portfolio's contact form. Sends submissions via Gmail
SMTP (Nodemailer) to the site owner's inbox.

## Local development

```bash
cd server
npm install
cp .env.example .env   # then fill in EMAIL_USER / EMAIL_PASS
npm run dev
```

`EMAIL_PASS` must be a Gmail **App Password**, not your regular account
password (Google Account -> Security -> 2-Step Verification -> App passwords).
Gmail SMTP requires 2-Step Verification to be enabled to generate one.

The frontend needs `VITE_API_URL` set to this server's URL (see the root
`.env.example`) — `http://localhost:5050` (or whatever `PORT` you set) locally.

## Endpoints

- `POST /api/contact` — `{ name, email, subject, message, honeypot }` ->
  `{ success, message }`. Validates required fields and email format, rate
  limits to 5 requests per 15 minutes per IP, and silently discards
  submissions where the honeypot field is filled.
- `GET /api/health` — liveness check.

## Deploying to Render

1. New Web Service, pointed at this repo, with **Root Directory** set to
   `server`.
2. Build command: `npm install`. Start command: `npm start`.
3. Set environment variables in the Render dashboard: `EMAIL_USER`,
   `EMAIL_PASS`, `CONTACT_RECEIVER_EMAIL` (optional), `CLIENT_ORIGIN` (your
   Netlify site URL — comma-separate multiple origins if needed). Render
   supplies `PORT` automatically.
4. On the Netlify side, set `VITE_API_URL` to the Render service's URL.
