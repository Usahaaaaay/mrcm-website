// Strips CR/LF from single-line fields so they can never be used for email
// header injection (e.g. a subject/name containing "\nBcc: ..."), then trims
// surrounding whitespace. Not used on `message`, which is expected to contain
// newlines and only ever lands in the email body, never a header.
export function sanitizeField(value) {
  return String(value ?? '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
}

// Escapes HTML-significant characters for safe interpolation into the HTML
// email alternative. Plain-text bodies don't need this — escaping there would
// corrupt legitimate characters (e.g. "Node.js & Express" -> "Node.js &amp; Express").
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
