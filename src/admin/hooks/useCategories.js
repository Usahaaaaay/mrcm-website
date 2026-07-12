import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function useCategories({ search = '', from = 0, to = 9 } = {}) {
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
        .from('categories')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true })
        .range(from, to)

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      const { data, count: total, error: queryError } = await query

      if (cancelled) return
      if (queryError) {
        setError(queryError)
      } else {
        setRows(data ?? [])
        setCount(total ?? 0)
        setError(null)
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [search, from, to, reloadKey])

  return { rows, count, loading, error, reload }
}

export async function checkCategoryNameExists(name, excludeId) {
  let query = supabase.from('categories').select('id').ilike('name', name)
  if (excludeId) query = query.neq('id', excludeId)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).length > 0
}

export async function createCategory(payload) {
  const { data, error } = await supabase.from('categories').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateCategory(id, payload) {
  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}
