const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([\w-]{11})/,
]
const VIMEO_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/

export function parseVideoUrl(url) {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern)
    if (match) return { provider: 'youtube', externalId: match[1] }
  }

  const vimeoMatch = url.match(VIMEO_PATTERN)
  if (vimeoMatch) return { provider: 'vimeo', externalId: vimeoMatch[1] }

  return null
}

const OEMBED_ENDPOINTS = {
  youtube: (url) => `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
  vimeo: (url) => `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
}

/**
 * Fetches public oEmbed metadata for a YouTube/Vimeo URL. Vimeo's response includes
 * `duration` (seconds); YouTube's oEmbed does not expose duration without an API key,
 * so it's left null there — a deliberate scope limit to avoid requiring a Google API key.
 */
export async function fetchVideoEmbedMeta(url) {
  const parsed = parseVideoUrl(url)
  if (!parsed) throw new Error('That doesn’t look like a YouTube or Vimeo URL.')

  const response = await fetch(OEMBED_ENDPOINTS[parsed.provider](url))
  if (!response.ok) throw new Error('Could not fetch video details for that URL.')
  const data = await response.json()

  return {
    provider: parsed.provider,
    externalId: parsed.externalId,
    title: data.title ?? '',
    thumbnailUrl: data.thumbnail_url ?? null,
    duration: data.duration ?? null,
  }
}

export function getEmbedUrl(videoLink) {
  if (videoLink.provider === 'youtube') return `https://www.youtube.com/embed/${videoLink.external_id}`
  return `https://player.vimeo.com/video/${videoLink.external_id}`
}
