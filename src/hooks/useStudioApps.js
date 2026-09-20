import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/** Public Apps listing: every visible studio_items row of kind 'app', ordered
 *  for display (sort_order, then newest first as a tiebreaker). RLS already
 *  restricts anon reads to visible=true (see
 *  supabase/migrations/0009_studio_content.sql), but the row is filtered
 *  explicitly here too so the query only ever asks for what it needs. */
export function useStudioApps() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('studio_items')
      .select('*, cover_media:media(*)')
      .eq('kind', 'app')
      .eq('visible', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data, error: queryError }) => {
        if (cancelled) return
        if (queryError) setError(queryError)
        else setApps(data ?? [])
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { apps, loading, error }
}
