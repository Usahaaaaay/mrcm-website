import { useState } from 'react'
import { Sparkles, Plus, X } from 'lucide-react'
import AboutSectionCard from './AboutSectionCard'
import SortableList from './SortableList'
import { fieldClasses } from './fieldClasses'
import Button from '../../../components/ui/Button'
import { SkeletonTable } from '../Skeleton'
import { useAboutCollection } from '../../hooks/useAboutCollections'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage, logDevError } from '../../lib/errors'

const SkillsSection = () => {
  const { items, loading, create, update, remove, reorder } = useAboutCollection('about_skills')
  const [draft, setDraft] = useState('')
  const toast = useToast()

  const handleAdd = async (event) => {
    event.preventDefault()
    if (!draft.trim()) return
    try {
      await create({ name: draft.trim() })
      setDraft('')
    } catch (err) {
      logDevError('create about_skills', err)
      toast.error(getErrorMessage(err, 'Could not add skill.'))
    }
  }

  const handleRename = async (id, name, previous) => {
    if (name === previous || !name.trim()) return
    try {
      await update(id, { name: name.trim() })
    } catch (err) {
      logDevError('update about_skills', err)
      toast.error(getErrorMessage(err, 'Could not update skill.'))
    }
  }

  return (
    <AboutSectionCard icon={Sparkles} title="Skills" description="Reorder by dragging; edits save when you click away.">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a skill…"
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
          emptyLabel="No skills yet."
          renderItem={(item) => (
            <div className="flex items-center gap-2 rounded-xl border border-navy/8 bg-cloud/40 px-3 py-2.5">
              <input
                defaultValue={item.name}
                onBlur={(e) => handleRename(item.id, e.target.value, item.name)}
                className="flex-1 bg-transparent text-sm text-navy focus:outline-none"
              />
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.name}`}
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

export default SkillsSection
