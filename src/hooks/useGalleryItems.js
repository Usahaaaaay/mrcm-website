import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useGalleryItems(limit = 12) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('gallery')
      .select('*, category:categories(*), media(*)')
      .order('created_at', { ascending: false })
      .limit(limit)
      .then(({ data, error: queryError }) => {
        if (cancelled) return
        if (queryError) setError(queryError)
        else setItems(data ?? [])
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [limit])

  return { items, loading, error }
}
