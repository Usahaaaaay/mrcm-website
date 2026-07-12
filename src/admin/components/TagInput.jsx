import { useState } from 'react'
import { X } from 'lucide-react'

const TagInput = ({ value, onChange, placeholder = 'Type and press Enter…' }) => {
  const [draft, setDraft] = useState('')

  const commit = () => {
    const tag = draft.trim()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setDraft('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-navy/12 bg-snow px-3 py-2.5 focus-within:border-lake">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-lake-50 px-3 py-1 text-xs font-medium text-lake">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-[8rem] flex-1 border-none bg-transparent text-sm text-navy placeholder:text-slate/50 focus:outline-none"
      />
    </div>
  )
}

export default TagInput
