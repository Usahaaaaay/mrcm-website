import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isConfigured) {
  console.error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY.. Copy .env.example to .env.local and fill in your Supabase project credentials. Falling back to a placeholder so the app can still render — all data requests will fail until this is configured.'
  )
}

// Placeholder values keep createClient() from throwing synchronously (and crashing the
// whole app at import time) when env vars aren't set yet; requests will simply fail.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

export const MEDIA_BUCKET = 'media'

export function getPublicMediaUrl(path) {
  if (!path) return null
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}
