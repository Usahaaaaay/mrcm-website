import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { inferAspect } from '../lib/mediaProcessing'

export function useGallery({ categoryId = 'all', from = 0, to = 19 } = {}) {
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
        .from('gallery')
        .select('*, category:categories(*), media(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (categoryId !== 'all') query = query.eq('category_id', categoryId)

      const { data, count: total, error: queryError } = await query
      if (cancelled) return
      if (queryError) setError(queryError)
      else {
        setRows(data ?? [])
        setCount(total ?? 0)
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [categoryId, from, to, reloadKey])

  return { rows, count, loading, error, reload }
}

export async function createGalleryItem({ title, mediaId, categoryId, media }) {
  const aspect = media ? inferAspect(media.width, media.height) : 'square'
  const { data, error } = await supabase
    .from('gallery')
    .insert({ title, media_id: mediaId, category_id: categoryId, aspect })
    .select('*, category:categories(*), media(*)')
    .single()
  if (error) throw error
  return data
}

export async function updateGalleryItem(id, payload) {
  const { data, error } = await supabase
    .from('gallery')
    .update(payload)
    .eq('id', id)
    .select('*, category:categories(*), media(*)')
    .single()
  if (error) throw error
  return data
}

export async function deleteGalleryItem(id) {
  const { error } = await supabase.from('gallery').delete().eq('id', id)
  if (error) throw error
}
