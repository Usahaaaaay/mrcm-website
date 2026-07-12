import { useCallback, useEffect, useState } from 'react'
import { supabase, MEDIA_BUCKET } from '../../lib/supabase'
import { getStoragePath } from '../lib/storagePaths'
import { sanitizeFilename, validateMediaFile } from '../lib/validation'
import { compressImage, readImageDimensions, captureVideoThumbnail } from '../lib/mediaProcessing'

export function useMedia({ search = '', type = 'all', categoryId = 'all', sort = 'newest', from = 0, to = 19 } = {}) {
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
      let query = supabase.from('media').select('*, category:categories(*)', { count: 'exact' }).range(from, to)

      if (search) query = query.ilike('filename', `%${search}%`)
      if (type !== 'all') query = query.eq('type', type)
      if (categoryId !== 'all') query = query.eq('category_id', categoryId)

      if (sort === 'newest') query = query.order('created_at', { ascending: false })
      if (sort === 'oldest') query = query.order('created_at', { ascending: true })
      if (sort === 'name') query = query.order('filename', { ascending: true })
      if (sort === 'size') query = query.order('file_size', { ascending: false })

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
  }, [search, type, categoryId, sort, from, to, reloadKey])

  return { rows, count, loading, error, reload }
}

/**
 * Uploads a single file (image or video) to Storage and inserts its media row.
 * `context` picks the storage folder (blog/portfolio/gallery/general/video).
 * `onProgress` receives a 0-100 number.
 */
export async function uploadMediaFile(file, { context = 'general', categoryId = null, onProgress } = {}) {
  const validationError = validateMediaFile(file)
  if (validationError) throw new Error(validationError)

  const isVideo = file.type.startsWith('video/')
  const cleanName = sanitizeFilename(file.name)

  onProgress?.(5)

  let uploadFile = file
  let width = null
  let height = null
  let duration = null
  let thumbnailPath = null

  if (isVideo) {
    const { thumbnailBlob, duration: dur, width: w, height: h } = await captureVideoThumbnail(file)
    duration = dur
    width = w
    height = h
    onProgress?.(30)

    if (thumbnailBlob) {
      const thumbPath = getStoragePath('video-thumbnail', `${cleanName}.jpg`)
      const { error: thumbError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(thumbPath, thumbnailBlob, { contentType: 'image/jpeg' })
      if (!thumbError) thumbnailPath = thumbPath
    }
  } else {
    const dimensions = await readImageDimensions(file)
    width = dimensions.width
    height = dimensions.height
    onProgress?.(20)
    uploadFile = await compressImage(file)
    onProgress?.(45)
  }

  const storagePath = getStoragePath(isVideo ? 'video' : context, cleanName)
  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, uploadFile, { contentType: file.type })
  if (uploadError) throw uploadError

  onProgress?.(85)

  const {
    data: { publicUrl },
  } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath)

  const { data, error: insertError } = await supabase
    .from('media')
    .insert({
      type: isVideo ? 'video' : 'image',
      filename: cleanName,
      storage_path: storagePath,
      url: publicUrl,
      mime_type: file.type,
      file_size: uploadFile.size,
      width,
      height,
      duration,
      thumbnail_path: thumbnailPath,
      category_id: categoryId,
    })
    .select('*, category:categories(*)')
    .single()

  if (insertError) throw insertError

  onProgress?.(100)
  return data
}

export async function updateMedia(id, payload) {
  const { data, error } = await supabase
    .from('media')
    .update(payload)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single()
  if (error) throw error
  return data
}

export async function replaceMediaFile(mediaRow, file) {
  const validationError = validateMediaFile(file)
  if (validationError) throw new Error(validationError)

  const isVideo = file.type.startsWith('video/')
  const uploadFile = isVideo ? file : await compressImage(file)

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(mediaRow.storage_path, uploadFile, { contentType: file.type, upsert: true })
  if (uploadError) throw uploadError

  const dimensions = isVideo ? {} : await readImageDimensions(file)

  return updateMedia(mediaRow.id, {
    file_size: uploadFile.size,
    mime_type: file.type,
    width: dimensions.width ?? mediaRow.width,
    height: dimensions.height ?? mediaRow.height,
  })
}

export async function deleteMedia(mediaRow) {
  await supabase.storage.from(MEDIA_BUCKET).remove([mediaRow.storage_path])
  if (mediaRow.thumbnail_path) {
    await supabase.storage.from(MEDIA_BUCKET).remove([mediaRow.thumbnail_path])
  }
  const { error } = await supabase.from('media').delete().eq('id', mediaRow.id)
  if (error) throw error
}

export async function bulkDeleteMedia(mediaRows) {
  const paths = mediaRows.flatMap((row) => [row.storage_path, row.thumbnail_path].filter(Boolean))
  if (paths.length > 0) await supabase.storage.from(MEDIA_BUCKET).remove(paths)
  const { error } = await supabase
    .from('media')
    .delete()
    .in('id', mediaRows.map((row) => row.id))
  if (error) throw error
}

export async function bulkAssignCategory(mediaIds, categoryId) {
  const { error } = await supabase.from('media').update({ category_id: categoryId }).in('id', mediaIds)
  if (error) throw error
}

export async function isMediaInUse(mediaId) {
  const [blogUsage, portfolioUsage, galleryUsage] = await Promise.all([
    supabase.from('blog_images').select('id', { count: 'exact', head: true }).eq('media_id', mediaId),
    supabase.from('portfolio_media').select('id', { count: 'exact', head: true }).eq('media_id', mediaId),
    supabase.from('gallery').select('id', { count: 'exact', head: true }).eq('media_id', mediaId),
  ])
  return (blogUsage.count ?? 0) + (portfolioUsage.count ?? 0) + (galleryUsage.count ?? 0) > 0
}
