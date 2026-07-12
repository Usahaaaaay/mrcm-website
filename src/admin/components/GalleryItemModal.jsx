import { useEffect, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import Modal from './Modal'
import Button from '../../components/ui/Button'
import CategorySelect from './CategorySelect'
import MediaPicker from './MediaPicker'
import { createGalleryItem, updateGalleryItem } from '../hooks/useGallery'
import { useToast } from '../hooks/useToast'

const fieldClasses =
  'w-full rounded-2xl border border-navy/12 bg-snow px-4 py-3 text-sm text-navy placeholder:text-slate/50 focus:border-lake focus:outline-none'

const GalleryItemModal = ({ open, onClose, item, onSaved }) => {
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [aspect, setAspect] = useState('square')
  const [media, setMedia] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (open) {
      setTitle(item?.title ?? '')
      setCategoryId(item?.category_id ?? null)
      setAspect(item?.aspect ?? 'square')
      setMedia(item?.media ?? null)
    }
  }, [open, item])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!title.trim() || !media) {
      toast.error('A title and an image are required.')
      return
    }

    setSaving(true)
    try {
      if (item) {
        await updateGalleryItem(item.id, {
          title: title.trim(),
          category_id: categoryId,
          aspect,
          media_id: media.id,
        })
        toast.success('Gallery item updated.')
      } else {
        await createGalleryItem({ title: title.trim(), mediaId: media.id, categoryId, media })
        toast.success('Gallery item added.')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message ?? 'Could not save this gallery item.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={item ? 'Edit Gallery Item' : 'Add Gallery Item'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {media ? (
          <img src={media.url} alt="" className="aspect-video w-full rounded-2xl object-cover" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-cloud text-slate/50">
            <ImagePlus size={24} />
          </div>
        )}
        <Button type="button" variant="secondary" onClick={() => setPickerOpen(true)}>
          {media ? 'Change Image' : 'Choose Image'}
        </Button>

        <div className="flex flex-col gap-2">
          <label htmlFor="gallery-title" className="text-sm font-medium text-navy">
            Title
          </label>
          <input
            id="gallery-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClasses}
            placeholder="Still Water, Blue Hour"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-navy">Category</span>
          <CategorySelect value={categoryId} onChange={setCategoryId} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-navy">Aspect</span>
          <select value={aspect} onChange={(e) => setAspect(e.target.value)} className={fieldClasses}>
            <option value="tall">Tall</option>
            <option value="wide">Wide</option>
            <option value="square">Square</option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} accept="image" context="gallery" onSelect={setMedia} />
    </Modal>
  )
}

export default GalleryItemModal
