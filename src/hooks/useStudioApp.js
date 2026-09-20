import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/** Public: a single visible app by slug, for the /studio/apps/:slug detail
 *  page. Mirrors useBlogPost.js's usePublishedPost — same shape, same
 *  cancellation-safe pattern. RLS already restricts anon reads to
 *  visible=true (see supabase/migrations/0009_studio_content.sql), but the
 *  row is filtered explicitly here too so an invisible/unpublished app can
 *  never reach this page even if RLS were ever misconfigured. */
export function useStudioApp(slug) {
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return

    let cancelled = false
    setLoading(true)
    setError(null)

    supabase
      .from('studio_items')
      .select('*, cover_media:media(*)')
      .eq('kind', 'app')
      .eq('slug', slug)
      .eq('visible', true)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (cancelled) return
        if (queryError) setError(queryError)
        else setApp(data)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  return { app, loading, error }
}
