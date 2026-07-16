import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/** Public: a single published post by slug, for the /blog/:slug detail page. */
export function usePublishedPost(slug) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return

    let cancelled = false
    setLoading(true)
    setError(null)

    supabase
      .from('blog_posts')
      .select('*, category:categories(*), cover_media:media(*)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (cancelled) return
        if (queryError) setError(queryError)
        else setPost(data)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  return { post, loading, error }
}
