const FOLDERS = {
  blog: 'images/blog',
  portfolio: 'images/portfolio',
  gallery: 'images/gallery',
  destination: 'images/locations',
  'about-photo': 'images/about',
  'about-resume': 'documents/resume',
  video: 'videos',
  'video-thumbnail': 'videos/thumbnails',
  general: 'images/general',
}

export function getStoragePath(context, filename) {
  const folder = FOLDERS[context] ?? FOLDERS.general
  const unique = `${crypto.randomUUID()}-${filename.replace(/\s+/g, '-')}`
  return `${folder}/${unique}`
}
