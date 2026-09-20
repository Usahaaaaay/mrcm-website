import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

/** Admin-facing: every studio_items row of the given kind ('app' | 'project'),
 *  regardless of visibility, with search/status/pagination — same shape as
 *  usePortfolio.js, parameterized by kind since Apps and Projects share one
 *  table (see supabase/migrations/0009_studio_content.sql). */
export function useStudioItems(kind, { search = '', status = 'all', from = 0, to = 9 } = {}) {
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
        .from('studio_items')
        .select('*, cover_media:media(*)', { count: 'exact' })
        .eq('kind', kind)
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false })
        .range(from, to)

      if (search) query = query.ilike('title', `%${search}%`)
      if (status !== 'all') query = query.eq('status', status)

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
  }, [kind, search, status, from, to, reloadKey])

  return { rows, count, loading, error, reload }
}

export async function getStudioItem(id) {
  const { data, error } = await supabase.from('studio_items').select('*, cover_media:media(*)').eq('id', id).single()
  if (error) throw error
  return data
}

/** Slugs only need to be unique within a kind — Apps and Projects are
 *  separate public sections, so an app and a project may share a slug. */
export async function checkStudioItemSlugExists(kind, slug, excludeId) {
  let query = supabase.from('studio_items').select('id').eq('kind', kind).eq('slug', slug)
  if (excludeId) query = query.neq('id', excludeId)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).length > 0
}

export async function createStudioItem(payload) {
  const { data, error } = await supabase
    .from('studio_items')
    .insert(payload)
    .select('*, cover_media:media(*)')
    .single()
  if (error) throw error
  return data
}

export async function updateStudioItem(id, payload) {
  const { data, error } = await supabase
    .from('studio_items')
    .update(payload)
    .eq('id', id)
    .select('*, cover_media:media(*)')
    .single()
  if (error) throw error
  return data
}

export async function deleteStudioItem(id) {
  const { error } = await supabase.from('studio_items').delete().eq('id', id)
  if (error) throw error
}
