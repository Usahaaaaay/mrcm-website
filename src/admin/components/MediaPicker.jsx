import { useState } from 'react'
import { Image as ImageIcon, Video, Check } from 'lucide-react'
import Modal from './Modal'
import FileDropzone from './FileDropzone'
import Button from '../../components/ui/Button'
import { useMedia, uploadMediaFile } from '../hooks/useMedia'
import { useToast } from '../hooks/useToast'
import { validateMediaFile } from '../lib/validation'
import { getErrorMessage, logDevError } from '../lib/errors'

/** Lets the caller pick an existing media item or upload a new one; resolves with the chosen media row. */
const MediaPicker = ({ open, onClose, onSelect, context = 'general', accept = 'image' }) => {
  const [tab, setTab] = useState('library')
  const [search, setSearch] = useState('')
  const { rows, loading, reload } = useMedia({ search, type: accept, from: 0, to: 39 })
  const [uploading, setUploading] = useState(false)
  const toast = useToast()

  const handleFiles = async (files) => {
    const file = files[0]
    if (!file) return
    const error = validateMediaFile(file)
    if (error) {
      toast.error(error)
      return
    }
    setUploading(true)
    try {
      const media = await uploadMediaFile(file, { context })
      toast.success('Uploaded.')
      onSelect(media)
      onClose()
    } catch (err) {
      logDevError('MediaPicker upload', err)
      toast.error(getErrorMessage(err, 'Upload failed.'))
    } finally {
      setUploading(false)
      reload()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Choose Media" className="max-w-2xl">
      <div className="flex flex-col gap-4">
        <div className="flex gap-1 rounded-full border border-navy/12 bg-cloud p-1 w-fit">
          <button
            type="button"
            onClick={() => setTab('library')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === 'library' ? 'bg-lake text-snow' : 'text-slate'
            }`}
          >
            Media Library
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === 'upload' ? 'bg-lake text-snow' : 'text-slate'
            }`}
          >
            Upload New
          </button>
        </div>

        {tab === 'upload' ? (
          <FileDropzone
            multiple={false}
            onFiles={handleFiles}
            label={uploading ? 'Uploading…' : `Drop a ${accept} here`}
          />
        ) : (
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-full border border-navy/12 bg-snow px-4 py-2.5 text-sm focus:border-lake focus:outline-none"
            />

            <div className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
              {loading ? (
                <p className="col-span-full py-8 text-center text-sm text-slate">Loading…</p>
              ) : rows.length === 0 ? (
                <div className="col-span-full flex flex-col items-center gap-2 py-8 text-center text-slate">
                  {accept === 'video' ? <Video size={22} /> : <ImageIcon size={22} />}
                  <p className="text-sm">No {accept}s yet.</p>
                </div>
              ) : (
                rows.map((media) => (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => {
                      onSelect(media)
                      onClose()
                    }}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-navy/8"
                  >
                    {media.type === 'image' ? (
                      <img src={media.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-navy text-alpine/50">
                        <Video size={20} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-navy/0 opacity-0 transition-all group-hover:bg-navy/40 group-hover:opacity-100">
                      <Check size={18} className="text-alpine" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default MediaPicker
