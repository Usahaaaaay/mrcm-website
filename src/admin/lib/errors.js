/**
 * Surfaces the real backend error instead of a generic message. Supabase/
 * PostgREST errors carry `message` (often the raw Postgres error text),
 * plus optional `details`/`hint`/`code` — composing them gives enough to
 * diagnose a failure (e.g. a trigger error) without opening devtools.
 */
export function getErrorMessage(err, fallback = 'Something went wrong.') {
  if (!err) return fallback
  const parts = [err.message || fallback]
  if (err.details) parts.push(err.details)
  if (err.hint) parts.push(`Hint: ${err.hint}`)
  return parts.filter(Boolean).join(' — ')
}

/** Logs the full error (incl. stack/code) to the console in development only. */
export function logDevError(context, err) {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, err)
  }
}
