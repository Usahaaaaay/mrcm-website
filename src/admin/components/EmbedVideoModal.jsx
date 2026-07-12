import { useState } from 'react'
import { Link2 } from 'lucide-react'
import Modal from './Modal'
import Button from '../../components/ui/Button'
import CategorySelect from './CategorySelect'
import { fetchVideoEmbedMeta } from '../lib/videoEmbed'
import { createVideoLink } from '../hooks/useVideoLinks'
import { useToast } from '../hooks/useToast'

const fieldClasses =
  'w-full rounded-2xl border border-navy/12 bg-snow px-4 py-3 text-sm text-navy placeholder:text-slate/50 focus:border-lake focus:outline-none'

const EmbedVideoModal = ({ open, onClose, onSaved }) => {
  const [url, setUrl] = useState('')
  const [meta, setMeta] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const reset = () => {
    setUrl('')
    setMeta(null)
    setError('')
    setDescription('')
    setCategoryId(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFetch = async () => {
    setError('')
    setFetching(true)
    try {
      const result = await fetchVideoEmbedMeta(url.trim())
      setMeta(result)
    } catch (err) {
      setError(err.message)
      setMeta(null)
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (!meta) return
    setSaving(true)
    try {
      await createVideoLink({
        provider: meta.provider,
        external_id: meta.externalId,
        url: url.trim(),
        title: meta.title,
        description: description.trim() || null,
        thumbnail_url: meta.thumbnailUrl,
        duration: meta.duration,
        category_id: categoryId,
      })
      toast.success('Video embedded.')
      onSaved()
      handleClose()
    } catch (err) {
      toast.error(err.message ?? 'Could not save this video.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Embed YouTube or Vimeo Video">
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="embed-url" className="text-sm font-medium text-navy">
            Video URL
          </label>
          <div className="flex gap-2">
            <input
              id="embed-url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setMeta(null)
              }}
              placeholder="https://www.youtube.com/watch?v=…"
              className={fieldClasses}
            />
            <Button type="button" variant="secondary" onClick={handleFetch} disabled={!url.trim() || fetching}>
              {fetching ? 'Fetching…' : 'Fetch'}
            </Button>
          </div>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>

        {meta ? (
          <div className="flex gap-3 rounded-2xl border border-navy/8 p-3">
            {meta.thumbnailUrl ? (
              <img src={meta.thumbnailUrl} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-cloud text-slate">
                <Link2 size={16} />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-navy">{meta.title}</p>
              <p className="text-xs capitalize text-slate">{meta.provider}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <label htmlFor="embed-description" className="text-sm font-medium text-navy">
            Description <span className="text-slate/60">(optional)</span>
          </label>
          <textarea
            id="embed-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${fieldClasses} resize-none`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-navy">Category</span>
          <CategorySelect value={categoryId} onChange={setCategoryId} />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!meta || saving}>
            {saving ? 'Saving…' : 'Save Video'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EmbedVideoModal
