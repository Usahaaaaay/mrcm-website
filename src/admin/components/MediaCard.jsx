import { useState } from 'react'
import { Pencil, Trash2, Link2, Video, Check } from 'lucide-react'
import { useToast } from '../hooks/useToast'

const MediaCard = ({ media, selected, onToggleSelect, onEdit, onDelete }) => {
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(media.url)
    setCopied(true)
    toast.success('URL copied to clipboard.')
    setTimeout(() => setCopied(false), 1500)
  }

  const thumbSrc = media.type === 'video' ? media.thumbnail_path && media.url : media.url

  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-navy/8 bg-cloud shadow-soft">
      <button
        type="button"
        onClick={() => onToggleSelect(media.id)}
        aria-label={selected ? 'Deselect' : 'Select'}
        className={`absolute left-2.5 top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
          selected ? 'border-lake bg-lake text-snow' : 'border-snow/70 bg-navy/20 text-transparent backdrop-blur-sm'
        }`}
      >
        <Check size={13} strokeWidth={3} />
      </button>

      {media.type === 'video' ? (
        <div className="flex h-full w-full items-center justify-center bg-navy text-alpine/40">
          <Video size={28} strokeWidth={1.25} />
        </div>
      ) : (
        <img src={thumbSrc} alt={media.alt_text ?? ''} loading="lazy" className="h-full w-full object-cover" />
      )}

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-navy/85 via-navy/10 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <p className="truncate text-xs font-medium text-alpine">{media.filename}</p>
        {media.category ? (
          <span className="mt-1 inline-flex w-fit rounded-full bg-alpine/15 px-2 py-0.5 text-[10px] text-alpine">
            {media.category.name}
          </span>
        ) : null}
        <div className="mt-2 flex gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(media)}
            aria-label="Edit"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-alpine/15 text-alpine hover:bg-alpine/25"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy URL"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-alpine/15 text-alpine hover:bg-alpine/25"
          >
            {copied ? <Check size={13} /> : <Link2 size={13} />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(media)}
            aria-label="Delete"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-alpine hover:bg-red-500/35"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default MediaCard
