import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function useVideoLinks({ search = '', categoryId = 'all', from = 0, to = 19 } = {}) {
  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      let query = supabase
        .from('video_links')
        .select('*, category:categories(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (search) query = query.ilike('title', `%${search}%`)
      if (categoryId !== 'all') query = query.eq('category_id', categoryId)

      const { data, count: total, error: queryError } = await query
      if (cancelled) return
      if (queryError) {
        setError(queryError)
      } else {
        setRows(data ?? [])
        setCount(total ?? 0)
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [search, categoryId, from, to, reloadKey])

  return { rows, count, loading, error, reload }
}

export async function createVideoLink(payload) {
  const { data, error } = await supabase
    .from('video_links')
    .insert(payload)
    .select('*, category:categories(*)')
    .single()
  if (error) throw error
  return data
}

export async function updateVideoLink(id, payload) {
  const { data, error } = await supabase
    .from('video_links')
    .update(payload)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single()
  if (error) throw error
  return data
}

export async function deleteVideoLink(id) {
  const { error } = await supabase.from('video_links').delete().eq('id', id)
  if (error) throw error
}
