import { useRef, useState } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Image as ImageIcon, Upload, Trash2 } from 'lucide-react'
import AboutSectionCard from './AboutSectionCard'
import Modal from '../Modal'
import Button from '../../../components/ui/Button'
import { supabase, MEDIA_BUCKET } from '../../../lib/supabase'
import { getStoragePath } from '../../lib/storagePaths'
import { compressImage } from '../../lib/mediaProcessing'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage, logDevError } from '../../lib/errors'

const centerAspectCrop = (mediaWidth, mediaHeight) =>
  centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, mediaWidth, mediaHeight), mediaWidth, mediaHeight)

async function cropToJpegBlob(image, crop) {
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const cropWidth = crop.width * scaleX
  const cropHeight = crop.height * scaleY

  const canvas = document.createElement('canvas')
  canvas.width = cropWidth
  canvas.height = cropHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
}

const ProfilePhotoUploader = ({ form, updateFields }) => {
  const [pendingSrc, setPendingSrc] = useState(null)
  const [crop, setCrop] = useState()
  const [uploading, setUploading] = useState(false)
  const imgRef = useRef(null)
  const fileInputRef = useRef(null)
  const toast = useToast()

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPendingSrc(URL.createObjectURL(file))
    event.target.value = ''
  }

  const handleImageLoad = (event) => {
    const { width, height } = event.currentTarget
    setCrop(centerAspectCrop(width, height))
  }

  const handleCancelCrop = () => {
    if (pendingSrc) URL.revokeObjectURL(pendingSrc)
    setPendingSrc(null)
    setCrop(undefined)
  }

  const handleConfirmCrop = async () => {
    if (!imgRef.current || !crop?.width) return
    setUploading(true)
    try {
      const blob = await cropToJpegBlob(imgRef.current, crop)
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' })
      const compressed = await compressImage(file)

      const path = getStoragePath('about-photo', 'profile.jpg')
      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, compressed, { contentType: 'image/jpeg' })
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)

      updateFields({ photo_url: publicUrl, photo_storage_path: path })
      toast.success('Photo updated — Publish to make it live.')
      handleCancelCrop()
    } catch (err) {
      logDevError('upload profile photo', err)
      toast.error(getErrorMessage(err, 'Could not upload photo.'))
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (form.photo_storage_path) {
      await supabase.storage.from(MEDIA_BUCKET).remove([form.photo_storage_path]).catch(() => {})
    }
    updateFields({ photo_url: null, photo_storage_path: null })
  }

  return (
    <AboutSectionCard icon={ImageIcon} title="Profile Photo" description="Square crop, compressed automatically before upload.">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border border-navy/8 bg-cloud">
          {form.photo_url ? (
            <img src={form.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate/40">
              <ImageIcon size={32} strokeWidth={1.25} />
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
          <Button type="button" variant="secondary" icon={Upload} onClick={() => fileInputRef.current?.click()}>
            {form.photo_url ? 'Replace Photo' : 'Upload Photo'}
          </Button>
          {form.photo_url ? (
            <Button type="button" variant="danger" icon={Trash2} onClick={handleDelete}>
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      <Modal open={Boolean(pendingSrc)} onClose={handleCancelCrop} title="Crop Photo" className="max-w-lg">
        {pendingSrc ? (
          <div className="flex flex-col gap-4">
            <ReactCrop crop={crop} onChange={(pixelCrop) => setCrop(pixelCrop)} aspect={1} circularCrop>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img ref={imgRef} src={pendingSrc} onLoad={handleImageLoad} className="max-h-[60vh] w-full" />
            </ReactCrop>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={handleCancelCrop}>
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleConfirmCrop} disabled={uploading}>
                {uploading ? 'Uploading…' : 'Save Photo'}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </AboutSectionCard>
  )
}

export default ProfilePhotoUploader
