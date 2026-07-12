import imageCompression from 'browser-image-compression'

export async function compressImage(file) {
  try {
    return await imageCompression(file, {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 2400,
      useWebWorker: true,
      fileType: file.type,
    })
  } catch {
    return file // fall back to the original if compression fails for any reason
  }
}

export function readImageDimensions(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      resolve({ width: null, height: null })
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

export function inferAspect(width, height) {
  if (!width || !height) return 'square'
  const ratio = width / height
  if (ratio > 1.15) return 'wide'
  if (ratio < 0.85) return 'tall'
  return 'square'
}

/** Captures a frame ~1s into an uploaded video as a JPEG thumbnail Blob, and reads its duration. */
export function captureVideoThumbnail(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.src = url
    video.muted = true
    video.playsInline = true
    video.preload = 'metadata'

    const cleanup = () => URL.revokeObjectURL(url)

    video.onloadedmetadata = () => {
      const duration = video.duration
      video.currentTime = Math.min(1, duration / 2)
    }

    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          resolve({ thumbnailBlob: blob, duration: video.duration, width: video.videoWidth, height: video.videoHeight })
          cleanup()
        },
        'image/jpeg',
        0.8
      )
    }

    video.onerror = () => {
      resolve({ thumbnailBlob: null, duration: null, width: null, height: null })
      cleanup()
    }
  })
}
