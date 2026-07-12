import { useState } from 'react'
import { Wrench, Plus, X } from 'lucide-react'
import AboutSectionCard from './AboutSectionCard'
import SortableList from './SortableList'
import IconPicker from './IconPicker'
import { fieldClasses } from './fieldClasses'
import Button from '../../../components/ui/Button'
import { SkeletonTable } from '../Skeleton'
import { useAboutCollection } from '../../hooks/useAboutCollections'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage, logDevError } from '../../lib/errors'

const TechnologiesSection = () => {
  const { items, loading, create, update, remove, reorder } = useAboutCollection('about_technologies')
  const [draft, setDraft] = useState('')
  const toast = useToast()

  const handleAdd = async (event) => {
    event.preventDefault()
    if (!draft.trim()) return
    try {
      await create({ name: draft.trim(), icon: 'code' })
      setDraft('')
    } catch (err) {
      logDevError('create about_technologies', err)
      toast.error(getErrorMessage(err, 'Could not add technology.'))
    }
  }

  const handleUpdate = async (id, payload) => {
    try {
      await update(id, payload)
    } catch (err) {
      logDevError('update about_technologies', err)
      toast.error(getErrorMessage(err, 'Could not update technology.'))
    }
  }

  return (
    <AboutSectionCard icon={Wrench} title="Technologies" description="Tools and stacks you work with, each with an icon.">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a technology…"
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
          emptyLabel="No technologies yet."
          renderItem={(item) => (
            <div className="flex flex-col gap-2 rounded-xl border border-navy/8 bg-cloud/40 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3">
              <input
                defaultValue={item.name}
                onBlur={(e) => e.target.value.trim() && e.target.value !== item.name && handleUpdate(item.id, { name: e.target.value.trim() })}
                className="flex-1 bg-transparent text-sm text-navy focus:outline-none"
              />
              <IconPicker value={item.icon} onChange={(icon) => handleUpdate(item.id, { icon })} />
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.name}`}
                className="shrink-0 self-start rounded-full p-1.5 text-slate/50 hover:bg-red-50 hover:text-red-600 sm:self-center"
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

export default TechnologiesSection
