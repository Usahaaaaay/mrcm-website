import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function usePublishedPosts(limit = 3) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('blog_posts')
      .select('*, category:categories(*), cover_media:media(*)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)
      .then(({ data, error: queryError }) => {
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
