import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { extractImageSrcs, syncContentMedia } from '../lib/contentMedia'

export function useBlogPosts({ search = '', status = 'all', categoryId = 'all', from = 0, to = 9 } = {}) {
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
        .from('blog_posts')
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

export async function getBlogPost(id) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, category:categories(*), cover_media:media(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function checkBlogSlugExists(slug, excludeId) {
  let query = supabase.from('blog_posts').select('id').eq('slug', slug)
  if (excludeId) query = query.neq('id', excludeId)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).length > 0
}

async function persistContentMedia(blogPostId, content) {
  const srcs = extractImageSrcs(content)
  await syncContentMedia({ table: 'blog_images', ownerColumn: 'blog_post_id', ownerId: blogPostId, srcs })
}

export async function createBlogPost(payload) {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(payload)
    .select('*, category:categories(*), cover_media:media(*)')
    .single()
  if (error) throw error
  await persistContentMedia(data.id, payload.content)
  return data
}

export async function updateBlogPost(id, payload) {
  const { data, error } = await supabase
    .from('blog_posts')
    .update(payload)
    .eq('id', id)
    .select('*, category:categories(*), cover_media:media(*)')
    .single()
  if (error) throw error
  if (payload.content !== undefined) await persistContentMedia(id, payload.content)
  return data
}

export async function deleteBlogPost(id) {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) throw error
}
