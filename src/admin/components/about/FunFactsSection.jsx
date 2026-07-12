import { useState } from 'react'
import { PartyPopper, Plus, X } from 'lucide-react'
import AboutSectionCard from './AboutSectionCard'
import SortableList from './SortableList'
import { fieldClasses } from './fieldClasses'
import Button from '../../../components/ui/Button'
import { SkeletonTable } from '../Skeleton'
import { useAboutCollection } from '../../hooks/useAboutCollections'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage, logDevError } from '../../lib/errors'

const FunFactsSection = () => {
  const { items, loading, create, update, remove, reorder } = useAboutCollection('about_fun_facts')
  const [emoji, setEmoji] = useState('')
  const [text, setText] = useState('')
  const toast = useToast()

  const handleAdd = async (event) => {
    event.preventDefault()
    if (!text.trim()) return
    try {
      await create({ emoji: emoji.trim() || null, text: text.trim() })
      setEmoji('')
      setText('')
    } catch (err) {
      logDevError('create about_fun_facts', err)
      toast.error(getErrorMessage(err, 'Could not add fun fact.'))
    }
  }

  const handleUpdate = async (id, payload) => {
    try {
      await update(id, payload)
    } catch (err) {
      logDevError('update about_fun_facts', err)
      toast.error(getErrorMessage(err, 'Could not update fun fact.'))
    }
  }

  return (
    <AboutSectionCard icon={PartyPopper} title="Fun Facts" description="Small, personal, a little playful.">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="☕"
          maxLength={4}
          className={`${fieldClasses} w-16 text-center`}
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Doesn't drink coffee"
          className={fieldClasses}
        />
        <Button type="submit" variant="secondary" icon={Plus}>
          Add
        </Button>
      </form>

      {loading ? (
        <SkeletonTable rows={3} cols={1} />
      ) : (
        <SortableList
          items={items}
          onReorder={reorder}
          emptyLabel="No fun facts yet."
          renderItem={(item) => (
            <div className="flex items-center gap-2 rounded-xl border border-navy/8 bg-cloud/40 px-3 py-2.5">
              <input
                defaultValue={item.emoji ?? ''}
                onBlur={(e) => e.target.value !== (item.emoji ?? '') && handleUpdate(item.id, { emoji: e.target.value || null })}
                className="w-10 shrink-0 bg-transparent text-center text-sm focus:outline-none"
              />
              <input
                defaultValue={item.text}
                onBlur={(e) => e.target.value.trim() && e.target.value !== item.text && handleUpdate(item.id, { text: e.target.value.trim() })}
                className="flex-1 bg-transparent text-sm text-navy focus:outline-none"
              />
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Remove"
                className="shrink-0 rounded-full p-1.5 text-slate/50 hover:bg-red-50 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          )}
        />
      )}
    </AboutSectionCard>
  )
}

export default FunFactsSection
