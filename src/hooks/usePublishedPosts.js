import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// `limit` is optional — omit it (or pass null/undefined) to fetch every
// published post, which is what the Blog listing page needs. Callers that
// want a capped preview (e.g. a homepage teaser) still pass an explicit
// number. A real `limit`+`offset` pagination scheme can build on this same
// query later without changing this hook's shape.
export function usePublishedPosts(limit) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    let query = supabase
      .from('blog_posts')
      .select('*, category:categories(*), cover_media:media(*)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (limit) query = query.limit(limit)

    query.then(({ data, error: queryError }) => {
      if (cancelled) return
      if (queryError) setError(queryError)
      else setPosts(data ?? [])
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [limit])

  return { posts, loading, error }
}
