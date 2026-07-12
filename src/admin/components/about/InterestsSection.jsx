import { useState } from 'react'
import { Heart, X } from 'lucide-react'
import AboutSectionCard from './AboutSectionCard'
import { useAboutCollection } from '../../hooks/useAboutCollections'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage, logDevError } from '../../lib/errors'

const InterestsSection = () => {
  const { items, loading, create, remove } = useAboutCollection('about_interests')
  const [draft, setDraft] = useState('')
  const toast = useToast()

  const handleAdd = async (event) => {
    event.preventDefault()
    const label = draft.trim()
    if (!label) return
    try {
      await create({ label })
      setDraft('')
    } catch (err) {
      logDevError('create about_interests', err)
      toast.error(getErrorMessage(err, 'Could not add interest.'))
    }
  }

  return (
    <AboutSectionCard icon={Heart} title="Interests" description="Simple tags — photography, travel, nature, and so on.">
      <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2 rounded-2xl border border-navy/12 bg-snow px-3 py-2.5 focus-within:border-lake">
        {loading ? (
          <span className="text-sm text-slate">Loading…</span>
        ) : (
          items.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 rounded-full bg-lake-50 px-3 py-1 text-xs font-medium text-lake"
            >
              {item.label}
              <button type="button" onClick={() => remove(item.id)} aria-label={`Remove ${item.label}`}>
                <X size={12} />
              </button>
            </span>
          ))
        )}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type and press Enter…"
          className="min-w-[8rem] flex-1 border-none bg-transparent text-sm text-navy placeholder:text-slate/50 focus:outline-none"
        />
      </form>
    </AboutSectionCard>
  )
}

export default InterestsSection
