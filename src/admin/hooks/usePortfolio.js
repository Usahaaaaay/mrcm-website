import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function usePortfolio({ search = '', status = 'all', categoryId = 'all', from = 0, to = 9 } = {}) {
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
        .from('portfolio_projects')
        .select('*, category:categories(*), cover_media:media(*)', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(from, to)

      if (search) query = query.ilike('title', `%${search}%`)
      if (status !== 'all') query = query.eq('status', status)
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
  }, [search, status, categoryId, from, to, reloadKey])

  return { rows, count, loading, error, reload }
}

export async function getPortfolioProject(id) {
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*, category:categories(*), cover_media:media(*), portfolio_media(sort_order, media(*))')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function checkPortfolioSlugExists(slug, excludeId) {
  let query = supabase.from('portfolio_projects').select('id').eq('slug', slug)
  if (excludeId) query = query.neq('id', excludeId)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).length > 0
}

export async function createPortfolioProject(payload) {
  const { data, error } = await supabase
    .from('portfolio_projects')
    .insert(payload)
    .select('*, category:categories(*), cover_media:media(*)')
    .single()
  if (error) throw error
  return data
}

export async function updatePortfolioProject(id, payload) {
  const { data, error } = await supabase
    .from('portfolio_projects')
    .update(payload)
    .eq('id', id)
    .select('*, category:categories(*), cover_media:media(*)')
    .single()
  if (error) throw error
  return data
}

export async function deletePortfolioProject(id) {
  const { error } = await supabase.from('portfolio_projects').delete().eq('id', id)
  if (error) throw error
}

export async function setPortfolioMedia(projectId, mediaIds) {
  await supabase.from('portfolio_media').delete().eq('portfolio_project_id', projectId)
  if (mediaIds.length > 0) {
    await supabase.from('portfolio_media').insert(
      mediaIds.map((mediaId, index) => ({ portfolio_project_id: projectId, media_id: mediaId, sort_order: index }))
    )
  }
}
