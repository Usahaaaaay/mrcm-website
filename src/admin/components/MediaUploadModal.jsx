import { useState } from 'react'
import { CheckCircle2, XCircle, FileImage, FileVideo } from 'lucide-react'
import Modal from './Modal'
import FileDropzone from './FileDropzone'
import CategorySelect from './CategorySelect'
import Button from '../../components/ui/Button'
import { uploadMediaFile } from '../hooks/useMedia'
import { validateMediaFile, formatFileSize } from '../lib/validation'
import { getErrorMessage, logDevError } from '../lib/errors'
import { useToast } from '../hooks/useToast'

let uid = 0

const MediaUploadModal = ({ open, onClose, context = 'general', onUploaded }) => {
  const [items, setItems] = useState([])
  const [categoryId, setCategoryId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const toast = useToast()

  const handleFiles = (files) => {
    const next = files.map((file) => {
      const error = validateMediaFile(file)
      return { id: ++uid, file, status: error ? 'error' : 'pending', progress: 0, error }
    })
    setItems((prev) => [...prev, ...next])
  }

  const handleClose = () => {
    if (uploading) return
    setItems([])
    onClose()
  }

  const handleUploadAll = async () => {
    setUploading(true)
    const uploaded = []

    for (const item of items) {
      if (item.status !== 'pending') continue
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading' } : i)))
      try {
        const result = await uploadMediaFile(item.file, {
          context,
          categoryId,
          onProgress: (progress) =>
            setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, progress } : i))),
        })
        uploaded.push(result)
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'done' } : i)))
      } catch (err) {
        logDevError('uploadMediaFile', err)
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'error', error: getErrorMessage(err) } : i))
        )
      }
    }

    setUploading(false)
    if (uploaded.length > 0) {
      toast.success(`Uploaded ${uploaded.length} file${uploaded.length > 1 ? 's' : ''}.`)
      onUploaded(uploaded)
    }
  }

  const pendingCount = items.filter((i) => i.status === 'pending').length

  return (
    <Modal open={open} onClose={handleClose} title="Upload Media" className="max-w-xl">
      <div className="flex flex-col gap-5">
        <FileDropzone onFiles={handleFiles} />

        {items.length > 0 ? (
          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
            {items.map((item) => {
              const Icon = item.file.type.startsWith('video/') ? FileVideo : FileImage
              return (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-navy/8 px-4 py-3">
                  <Icon size={16} className="shrink-0 text-slate" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-navy">{item.file.name}</p>
                    <p className="text-xs text-slate/70">{formatFileSize(item.file.size)}</p>
                    {item.status === 'uploading' || item.status === 'done' ? (
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-navy/8">
                        <div
                          className="h-full rounded-full bg-lake transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    ) : null}
                    {item.status === 'error' ? <p className="mt-1 text-xs text-red-600">{item.error}</p> : null}
                  </div>
                  {item.status === 'done' ? <CheckCircle2 size={17} className="shrink-0 text-lake" /> : null}
                  {item.status === 'error' ? <XCircle size={17} className="shrink-0 text-red-600" /> : null}
                </div>
              )
            })}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-navy">Category for these uploads (optional)</span>
          <CategorySelect value={categoryId} onChange={setCategoryId} />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={uploading}>
            {items.some((i) => i.status === 'done') ? 'Done' : 'Cancel'}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleUploadAll}
            disabled={uploading || pendingCount === 0}
          >
            {uploading ? 'Uploading…' : `Upload ${pendingCount || ''}`.trim()}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default MediaUploadModal
