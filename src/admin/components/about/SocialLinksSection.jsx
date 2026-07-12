import { useState } from 'react'
import { Share2, Plus, X, Eye, EyeOff } from 'lucide-react'
import AboutSectionCard from './AboutSectionCard'
import SortableList from './SortableList'
import { fieldClasses } from './fieldClasses'
import Button from '../../../components/ui/Button'
import { SkeletonTable } from '../Skeleton'
import { useAboutCollection } from '../../hooks/useAboutCollections'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage, logDevError } from '../../lib/errors'
import { SOCIAL_PLATFORMS, getSocialPlatform } from '../../../lib/socialPlatforms'
import { isValidUrl } from '../../lib/validation'

const SocialLinksSection = () => {
  const { items, loading, create, update, remove, reorder } = useAboutCollection('about_social_links')
  const [platform, setPlatform] = useState(SOCIAL_PLATFORMS[0].value)
  const [url, setUrl] = useState('')
  const toast = useToast()

  const handleAdd = async (event) => {
    event.preventDefault()
    if (!url.trim() || !isValidUrl(url.trim())) {
      toast.error('Enter a valid URL (starting with http:// or https://).')
      return
    }
    try {
      await create({ platform, url: url.trim(), icon: platform, visible: true })
      setUrl('')
    } catch (err) {
      logDevError('create about_social_links', err)
      toast.error(getErrorMessage(err, 'Could not add social link.'))
    }
  }

  const handleUpdate = async (id, payload) => {
    try {
      await update(id, payload)
    } catch (err) {
      logDevError('update about_social_links', err)
      toast.error(getErrorMessage(err, 'Could not update social link.'))
    }
  }

  return (
    <AboutSectionCard icon={Share2} title="Social Links" description="Shown as icon links on the public About section.">
      <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={`${fieldClasses} sm:w-40`}>
          {SOCIAL_PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className={fieldClasses}
        />
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
          emptyLabel="No social links yet."
          renderItem={(item) => {
            const meta = getSocialPlatform(item.platform)
            const Icon = meta.icon
            return (
              <div className="flex items-center gap-2 rounded-xl border border-navy/8 bg-cloud/40 px-3 py-2.5">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lake-50 text-lake">
                  <Icon size={14} />
                </span>
                <span className="w-24 shrink-0 text-sm font-medium text-navy">{meta.label}</span>
                <input
                  defaultValue={item.url}
                  onBlur={(e) => e.target.value.trim() && e.target.value !== item.url && handleUpdate(item.id, { url: e.target.value.trim() })}
                  className="flex-1 bg-transparent text-sm text-navy focus:outline-none"
                />
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
            )
          }}
        />
      )}
    </AboutSectionCard>
  )
}

export default SocialLinksSection
