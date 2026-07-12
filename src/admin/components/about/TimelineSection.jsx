import { useState } from 'react'
import { History, Plus, X } from 'lucide-react'
import AboutSectionCard from './AboutSectionCard'
import SortableList from './SortableList'
import { fieldClasses } from './fieldClasses'
import Button from '../../../components/ui/Button'
import { SkeletonTable } from '../Skeleton'
import { useAboutCollection } from '../../hooks/useAboutCollections'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage, logDevError } from '../../lib/errors'

const TimelineSection = () => {
  const { items, loading, create, update, remove, reorder } = useAboutCollection('about_timeline')
  const [year, setYear] = useState('')
  const [title, setTitle] = useState('')
  const toast = useToast()

  const handleAdd = async (event) => {
    event.preventDefault()
    if (!year.trim() || !title.trim()) return
    try {
      await create({ year: year.trim(), title: title.trim(), description: null })
      setYear('')
      setTitle('')
    } catch (err) {
      logDevError('create about_timeline', err)
      toast.error(getErrorMessage(err, 'Could not add timeline entry.'))
    }
  }

  const handleUpdate = async (id, payload) => {
    try {
      await update(id, payload)
    } catch (err) {
      logDevError('update about_timeline', err)
      toast.error(getErrorMessage(err, 'Could not update timeline entry.'))
    }
  }

  return (
    <AboutSectionCard icon={History} title="Timeline" description="Milestones, in order — drag to reorder.">
      <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
        <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2026" className={`${fieldClasses} sm:w-24`} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Created Personal Website" className={fieldClasses} />
        <Button type="submit" variant="secondary" icon={Plus} className="shrink-0">
          Add
        </Button>
      </form>

      {loading ? (
        <SkeletonTable rows={3} cols={1} />
      ) : (
        <SortableList
          items={items}
          onReorder={reorder}
          emptyLabel="No timeline entries yet."
          renderItem={(item) => (
            <div className="flex flex-col gap-2 rounded-xl border border-navy/8 bg-cloud/40 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <input
                  defaultValue={item.year}
                  onBlur={(e) => e.target.value.trim() && e.target.value !== item.year && handleUpdate(item.id, { year: e.target.value.trim() })}
                  className="w-16 shrink-0 bg-transparent text-sm font-semibold text-navy focus:outline-none"
                />
                <input
                  defaultValue={item.title}
                  onBlur={(e) => e.target.value.trim() && e.target.value !== item.title && handleUpdate(item.id, { title: e.target.value.trim() })}
                  className="flex-1 bg-transparent text-sm font-medium text-navy focus:outline-none"
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
              <textarea
                defaultValue={item.description ?? ''}
                onBlur={(e) => e.target.value !== (item.description ?? '') && handleUpdate(item.id, { description: e.target.value || null })}
                placeholder="Short description"
                rows={2}
                className="resize-none rounded-lg border border-navy/8 bg-snow px-2.5 py-2 text-xs text-slate focus:border-lake focus:outline-none"
              />
            </div>
          )}
        />
      )}
    </AboutSectionCard>
  )
}

export default TimelineSection
