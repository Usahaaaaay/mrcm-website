import { supabase } from '../../lib/supabase'

function extractSrcs(node, acc) {
  if (!node) return acc
  if ((node.type === 'image' || node.type === 'video') && node.attrs?.src) {
    acc.push(node.attrs.src)
  }
  node.content?.forEach((child) => extractSrcs(child, acc))
  return acc
}

export function extractImageSrcs(tiptapJSON) {
  if (!tiptapJSON) return []
  return extractSrcs(tiptapJSON, [])
}

/** Reconciles a join table (blog_images / portfolio_media) with the media actually used in rich content. */
export async function syncContentMedia({ table, ownerColumn, ownerId, srcs }) {
  if (srcs.length === 0) {
    await supabase.from(table).delete().eq(ownerColumn, ownerId)
    return
  }

  const { data: mediaRows } = await supabase.from('media').select('id, url').in('url', srcs)
  const mediaIds = (mediaRows ?? []).map((row) => row.id)

  await supabase.from(table).delete().eq(ownerColumn, ownerId)
  if (mediaIds.length > 0) {
    await supabase.from(table).insert(
      mediaIds.map((mediaId, index) => ({ [ownerColumn]: ownerId, media_id: mediaId, sort_order: index }))
    )
  }
}
