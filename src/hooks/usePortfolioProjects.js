import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function usePortfolioProjects(limit = 9) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('portfolio_projects')
      .select('*, category:categories(*), cover_media:media(*)')
      .order('created_at', { ascending: false })
      .limit(limit)
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error) setProjects(data ?? [])
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [limit])

  return { projects, loading }
}
