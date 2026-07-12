import { useState } from 'react'
import { BarChart3, Plus, X, Eye, EyeOff } from 'lucide-react'
import AboutSectionCard from './AboutSectionCard'
import SortableList from './SortableList'
import IconPicker from './IconPicker'
import { fieldClasses } from './fieldClasses'
import Button from '../../../components/ui/Button'
import { SkeletonTable } from '../Skeleton'
import { useAboutCollection } from '../../hooks/useAboutCollections'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage, logDevError } from '../../lib/errors'

const StatisticsSection = () => {
  const { items, loading, create, update, remove, reorder } = useAboutCollection('about_statistics')
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const toast = useToast()

  const handleAdd = async (event) => {
    event.preventDefault()
    if (!label.trim() || !value.trim()) return
    try {
      await create({ label: label.trim(), value: value.trim(), icon: 'sparkles', visible: true })
      setLabel('')
      setValue('')
    } catch (err) {
      logDevError('create about_statistics', err)
      toast.error(getErrorMessage(err, 'Could not add statistic.'))
    }
  }

  const handleUpdate = async (id, payload) => {
    try {
      await update(id, payload)
    } catch (err) {
      logDevError('update about_statistics', err)
      toast.error(getErrorMessage(err, 'Could not update statistic.'))
    }
  }

  return (
    <AboutSectionCard icon={BarChart3} title="Statistics" description="Editable counters — e.g. Years Coding, Projects Completed.">
      <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="5+" className={`${fieldClasses} sm:w-24`} />
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Years Coding" className={fieldClasses} />
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
          emptyLabel="No statistics yet."
          renderItem={(item) => (
            <div className="flex flex-col gap-2 rounded-xl border border-navy/8 bg-cloud/40 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3">
              <input
                defaultValue={item.value}
                onBlur={(e) => e.target.value.trim() && e.target.value !== item.value && handleUpdate(item.id, { value: e.target.value.trim() })}
                className="w-20 shrink-0 bg-transparent text-sm font-semibold text-navy focus:outline-none"
              />
              <input
                defaultValue={item.label}
                onBlur={(e) => e.target.value.trim() && e.target.value !== item.label && handleUpdate(item.id, { label: e.target.value.trim() })}
                className="flex-1 bg-transparent text-sm text-navy focus:outline-none"
              />
              <IconPicker value={item.icon} onChange={(icon) => handleUpdate(item.id, { icon })} />
              <button
                type="button"
                onClick={() => handleUpdate(item.id, { visible: !item.visible })}
                aria-label={item.visible ? 'Hide' : 'Show'}
                className="shrink-0 rounded-full p-1.5 text-slate/50 hover:bg-cloud hover:text-navy"
              >
                {item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
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

export default StatisticsSection
