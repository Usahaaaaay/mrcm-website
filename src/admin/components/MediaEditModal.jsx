import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import Modal from './Modal'
import CategorySelect from './CategorySelect'
import Button from '../../components/ui/Button'
import { updateMedia, replaceMediaFile } from '../hooks/useMedia'
import { useToast } from '../hooks/useToast'
import { formatFileSize } from '../lib/validation'
import { getErrorMessage, logDevError } from '../lib/errors'

const fieldClasses =
  'w-full rounded-2xl border border-navy/12 bg-snow px-4 py-3 text-sm text-navy placeholder:text-slate/50 focus:border-lake focus:outline-none'

const MediaEditModal = ({ open, onClose, media, onSaved }) => {
  const [form, setForm] = useState({ filename: '', altText: '', caption: '', categoryId: null })
  const [saving, setSaving] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const fileInputRef = useRef(null)
  const toast = useToast()

  useEffect(() => {
    if (open && media) {
      setForm({
        filename: media.filename,
        altText: media.alt_text ?? '',
        caption: media.caption ?? '',
        categoryId: media.category_id,
      })
    }
  }, [open, media])

  if (!media) return null

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await updateMedia(media.id, {
        filename: form.filename.trim(),
        alt_text: form.altText.trim() || null,
        caption: form.caption.trim() || null,
        category_id: form.categoryId,
      })
      toast.success('Media updated.')
      onSaved()
      onClose()
    } catch (err) {
      logDevError('updateMedia', err)
      toast.error(getErrorMessage(err, 'Could not update media.'))
    } finally {
      setSaving(false)
    }
  }

  const handleReplace = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setReplacing(true)
    try {
      await replaceMediaFile(media, file)
      toast.success('File replaced.')
      onSaved()
    } catch (err) {
      logDevError('replaceMediaFile', err)
      toast.error(getErrorMessage(err, 'Could not replace file.'))
    } finally {
      setReplacing(false)
      event.target.value = ''
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Media">
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {media.type === 'image' ? (
          <img src={media.url} alt="" className="max-h-56 w-full rounded-2xl object-contain bg-cloud" />
        ) : (
          <video src={media.url} controls className="max-h-56 w-full rounded-2xl bg-navy" />
        )}

        <p className="text-xs text-slate">
          {formatFileSize(media.file_size)} · {media.width && media.height ? `${media.width}×${media.height}` : media.mime_type}
        </p>

        <div className="flex flex-col gap-2">
          <label htmlFor="media-filename" className="text-sm font-medium text-navy">
            Filename
          </label>
          <input
            id="media-filename"
            value={form.filename}
            onChange={(e) => setForm((prev) => ({ ...prev, filename: e.target.value }))}
            className={fieldClasses}
          />
        </div>

        {media.type === 'image' ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="media-alt" className="text-sm font-medium text-navy">
              Alt text
            </label>
            <input
              id="media-alt"
              value={form.altText}
              onChange={(e) => setForm((prev) => ({ ...prev, altText: e.target.value }))}
              className={fieldClasses}
              placeholder="Describes the image for accessibility"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <label htmlFor="media-caption" className="text-sm font-medium text-navy">
            Caption
          </label>
          <input
            id="media-caption"
            value={form.caption}
            onChange={(e) => setForm((prev) => ({ ...prev, caption: e.target.value }))}
            className={fieldClasses}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-navy">Category</span>
          <CategorySelect value={form.categoryId} onChange={(v) => setForm((prev) => ({ ...prev, categoryId: v }))} />
        </div>

        <div className="flex items-center justify-between border-t border-navy/8 pt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={replacing}
            className="inline-flex items-center gap-2 text-sm font-medium text-lake hover:underline"
          >
            <RefreshCw size={14} className={replacing ? 'animate-spin' : ''} />
            {replacing ? 'Replacing…' : 'Replace file'}
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleReplace} accept="image/*,video/*" />

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default MediaEditModal
