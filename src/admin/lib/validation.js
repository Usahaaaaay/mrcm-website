export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
export const ALLOWED_MEDIA_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]

export const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024 // 15MB pre-compression ceiling
export const MAX_VIDEO_SIZE_BYTES = 150 * 1024 * 1024 // 150MB

const DANGEROUS_EXTENSIONS = /\.(exe|sh|bat|cmd|com|msi|php|js|jsx|ts|tsx|html|htm|py|rb|jar|scr|ps1)$/i

export function sanitizeFilename(filename) {
  return filename
    .normalize('NFKD')
    .replace(/[^\w.\-\s]/g, '')
    .trim()
    .slice(0, 150)
}

export function validateMediaFile(file) {
  if (DANGEROUS_EXTENSIONS.test(file.name)) {
    return `"${file.name}" has a file type that isn't allowed.`
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

  if (!isImage && !isVideo) {
    return `"${file.name}" must be a JPG, PNG, WEBP, MP4, MOV, or WEBM file.`
  }

  if (isImage && file.size > MAX_IMAGE_SIZE_BYTES) {
    return `"${file.name}" is larger than the 15MB image limit.`
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
    return `"${file.name}" is larger than the 150MB video limit.`
  }

  return null
}

export const MAX_TITLE_LENGTH = 150

export function isValidUrl(value) {
  if (!value) return true // empty is allowed; required-ness is checked separately
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`
}
