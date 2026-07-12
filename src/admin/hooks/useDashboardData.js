import { useEffect, useState } from 'react'
import { startOfMonth } from 'date-fns'
import { supabase } from '../../lib/supabase'

const countTable = async (table, filter) => {
  let query = supabase.from(table).select('*', { count: 'exact', head: true })
  if (filter) query = filter(query)
  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

const countSince = (table, isoDate, filter) =>
  countTable(table, (q) => {
    const withDate = q.gte('created_at', isoDate)
    return filter ? filter(withDate) : withDate
  })

export function useDashboardData() {
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [latest, setLatest] = useState({ posts: [], projects: [], gallery: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const monthStart = startOfMonth(new Date()).toISOString()

        const [
          blogPosts,
          portfolioProjects,
          galleryItems,
          categories,
          images,
          videos,
          blogPostsThisMonth,
          portfolioProjectsThisMonth,
          galleryItemsThisMonth,
          categoriesThisMonth,
          imagesThisMonth,
          videosThisMonth,
          activityRes,
          latestPostsRes,
          latestProjectsRes,
          latestGalleryRes,
          mediaSizeRes,
        ] = await Promise.all([
          countTable('blog_posts'),
          countTable('portfolio_projects'),
          countTable('gallery'),
          countTable('categories'),
          countTable('media', (q) => q.eq('type', 'image')),
          countTable('media', (q) => q.eq('type', 'video')),
          countSince('blog_posts', monthStart),
          countSince('portfolio_projects', monthStart),
          countSince('gallery', monthStart),
          countSince('categories', monthStart),
          countSince('media', monthStart, (q) => q.eq('type', 'image')),
          countSince('media', monthStart, (q) => q.eq('type', 'video')),
          supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(5),
          supabase
            .from('blog_posts')
            .select('id, title, slug, status, updated_at, cover_media:media(url)')
            .order('updated_at', { ascending: false })
            .limit(5),
          supabase
            .from('portfolio_projects')
            .select('id, title, slug, status, updated_at, cover_media:media(url)')
            .order('updated_at', { ascending: false })
            .limit(5),
          supabase
            .from('gallery')
            .select('id, title, created_at, media(url), category:categories(name)')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase.from('media').select('file_size'),
        ])

        if (activityRes.error) throw activityRes.error
        if (latestPostsRes.error) throw latestPostsRes.error
        if (latestProjectsRes.error) throw latestProjectsRes.error
        if (latestGalleryRes.error) throw latestGalleryRes.error

        const storageUsedBytes = (mediaSizeRes.data ?? []).reduce((sum, row) => sum + (row.file_size ?? 0), 0)

        if (!cancelled) {
          setStats({
            blogPosts,
            portfolioProjects,
            galleryItems,
            categories,
            images,
            videos,
            deltas: {
              blogPosts: blogPostsThisMonth,
              portfolioProjects: portfolioProjectsThisMonth,
              galleryItems: galleryItemsThisMonth,
              categories: categoriesThisMonth,
              images: imagesThisMonth,
              videos: videosThisMonth,
            },
            storageUsedBytes,
          })
          setActivity(activityRes.data ?? [])
          setLatest({
            posts: latestPostsRes.data ?? [],
            projects: latestProjectsRes.data ?? [],
            gallery: latestGalleryRes.data ?? [],
          })
          setUpdatedAt(new Date())
        }
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { stats, activity, latest, loading, error, updatedAt }
}
