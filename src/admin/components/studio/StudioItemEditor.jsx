import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ImagePlus } from 'lucide-react'
import MediaPicker from '../MediaPicker'
import TagInput from '../TagInput'
import Button from '../../../components/ui/Button'
import { slugify } from '../../lib/slugify'
import { MAX_TITLE_LENGTH, isValidUrl } from '../../lib/validation'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage, logDevError } from '../../lib/errors'
import {
  getStudioItem,
  createStudioItem,
  updateStudioItem,
  checkStudioItemSlugExists,
} from '../../hooks/useStudioItems'

const fieldClasses =
  'w-full rounded-2xl border border-navy/12 bg-snow px-4 py-3 text-sm text-navy placeholder:text-slate/50 focus:border-lake focus:outline-none'

const AUTOSAVE_DELAY = 2000

const emptyForm = {
  title: '',
  slug: '',
  tagline: '',
  description: '',
  coverMedia: null,
  status: 'Planned',
  techStack: [],
  demoUrl: '',
  appStoreUrl: '',
  githubUrl: '',
  visible: true,
  sortOrder: 0,
}

/** Shared editor view backing both the Apps and Projects create/edit routes
 *  — see StudioItemsList.jsx for why one implementation covers both kinds. */
const StudioItemEditor = ({ kind, basePath, titleSingular, mediaContext }) => {
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [itemId, setItemId] = useState(routeId ?? null)
  const [form, setForm] = useState(emptyForm)
  const [slugTouched, setSlugTouched] = useState(Boolean(routeId))
  const [loading, setLoading] = useState(Boolean(routeId))
  const [loadError, setLoadError] = useState(false)
  const [saveState, setSaveState] = useState('idle')
  const [coverPickerOpen, setCoverPickerOpen] = useState(false)
  const autosaveTimer = useRef(null)
  const skipNextAutosave = useRef(true)

  useEffect(() => {
    if (!routeId) return
    getStudioItem(routeId)
      .then((item) => {
        setForm({
          title: item.title,
          slug: item.slug,
          tagline: item.tagline ?? '',
          description: item.description ?? '',
          coverMedia: item.cover_media,
          status: item.status,
          techStack: item.tech_stack ?? [],
          demoUrl: item.demo_url ?? '',
          appStoreUrl: item.app_store_url ?? '',
          githubUrl: item.github_url ?? '',
          visible: item.visible,
          sortOrder: item.sort_order,
        })
      })
      .catch((err) => {
        logDevError('StudioItemEditor load', err)
        setLoadError(true)
        toast.error(getErrorMessage(err, `Could not load this ${titleSingular.toLowerCase()}.`))
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId])

  const buildPayload = (overrides = {}) => ({
    kind,
    title: form.title.trim(),
    slug: slugify(form.slug || form.title),
    tagline: form.tagline.trim() || null,
    description: form.description.trim() || null,
    status: form.status,
    tech_stack: form.techStack,
    demo_url: form.demoUrl.trim() || null,
    app_store_url: form.appStoreUrl.trim() || null,
    github_url: form.githubUrl.trim() || null,
    cover_media_id: form.coverMedia?.id ?? null,
    visible: form.visible,
    sort_order: Number.isFinite(Number(form.sortOrder)) ? Number(form.sortOrder) : 0,
    ...overrides,
  })

  const save = async (overrides = {}) => {
    if (!form.title.trim()) {
      toast.error('Title is required.')
      return null
    }
    if (form.title.trim().length > MAX_TITLE_LENGTH) {
      toast.error(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`)
      return null
    }
    if (!isValidUrl(form.demoUrl.trim())) {
      toast.error('Demo URL must be a valid http(s) link.')
      return null
    }
    if (!isValidUrl(form.appStoreUrl.trim())) {
      toast.error('App Store URL must be a valid http(s) link.')
      return null
    }
    if (!isValidUrl(form.githubUrl.trim())) {
      toast.error('GitHub URL must be a valid http(s) link.')
      return null
    }

    const slug = slugify(form.slug || form.title)
    if (!slug) {
      toast.error('Slug could not be generated from this title — set one manually.')
      return null
    }

    setSaveState('saving')
    try {
      const duplicate = await checkStudioItemSlugExists(kind, slug, itemId)
      if (duplicate) {
        toast.error(`That slug is already in use by another ${titleSingular.toLowerCase()}.`)
        setSaveState('error')
        return null
      }

      const payload = buildPayload(overrides)
      const saved = itemId ? await updateStudioItem(itemId, payload) : await createStudioItem(payload)

      if (!itemId) {
        setItemId(saved.id)
        navigate(`${basePath}/${saved.id}/edit`, { replace: true })
      }
      setSaveState('saved')
      return saved
    } catch (err) {
      logDevError('StudioItemEditor save', err)
      toast.error(getErrorMessage(err, `Could not save this ${titleSingular.toLowerCase()}.`))
      setSaveState('error')
      return null
    }
  }

  useEffect(() => {
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false
      return
    }
    if (!form.title.trim()) return

    clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      save()
    }, AUTOSAVE_DELAY)

    return () => clearTimeout(autosaveTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.title,
    form.slug,
    form.tagline,
    form.description,
    form.coverMedia,
    form.status,
    form.techStack,
    form.demoUrl,
    form.appStoreUrl,
    form.githubUrl,
    form.visible,
    form.sortOrder,
  ])

  const handleTitleChange = (value) => {
    setForm((prev) => ({ ...prev, title: value, slug: slugTouched ? prev.slug : slugify(value) }))
  }

  if (loading) return <p className="text-sm text-slate">Loading…</p>

  if (loadError) {
    return (
      <p className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
        Couldn&rsquo;t load this {titleSingular.toLowerCase()}. Go back and try again.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">
            {itemId ? `Edit ${titleSingular}` : `New ${titleSingular}`}
          </h1>
          <p className="mt-1 text-xs text-slate">
            {saveState === 'saving' && 'Saving…'}
            {saveState === 'saved' && 'All changes saved'}
            {saveState === 'error' && 'Could not save — check the slug and links and try again'}
            {saveState === 'idle' && 'Autosaves as you type'}
          </p>
        </div>
        <Button variant="secondary" icon={Save} onClick={() => save()}>
          Save
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-5">
          <input
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            placeholder={`${titleSingular} title`}
            className="w-full rounded-2xl border border-navy/12 bg-snow px-5 py-4 text-xl font-semibold text-navy placeholder:text-slate/40 focus:border-lake focus:outline-none"
          />

          <div className="flex flex-col gap-2">
            <label htmlFor="studio-item-tagline" className="text-sm font-medium text-navy">
              Tagline <span className="text-slate/60">(optional, a short one-liner)</span>
            </label>
            <input
              id="studio-item-tagline"
              value={form.tagline}
              onChange={(e) => setForm((prev) => ({ ...prev, tagline: e.target.value }))}
              className={fieldClasses}
              placeholder="Shown right under the title"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="studio-item-description" className="text-sm font-medium text-navy">
              Description
            </label>
            <textarea
              id="studio-item-description"
              rows={5}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className={`${fieldClasses} resize-none`}
              placeholder={`Shown on the public ${titleSingular.toLowerCase()} card`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 rounded-3xl border border-navy/8 bg-snow p-5 shadow-soft">
            <label htmlFor="studio-item-slug" className="text-sm font-medium text-navy">
              Slug
            </label>
            <input
              id="studio-item-slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                setForm((prev) => ({ ...prev, slug: e.target.value }))
              }}
              className={fieldClasses}
            />

            <label className="mt-2 text-sm font-medium text-navy">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              className={fieldClasses}
            >
              <option value="Live">Live</option>
              <option value="In Progress">In Progress</option>
              <option value="Planned">Planned</option>
              <option value="Archived">Archived</option>
            </select>

            <label className="mt-2 text-sm font-medium text-navy">Tech Stack</label>
            <TagInput value={form.techStack} onChange={(v) => setForm((prev) => ({ ...prev, techStack: v }))} />

            <label htmlFor="studio-item-demo" className="mt-2 text-sm font-medium text-navy">
              Demo URL
            </label>
            <input
              id="studio-item-demo"
              value={form.demoUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, demoUrl: e.target.value }))}
              className={fieldClasses}
              placeholder="https://…"
            />

            <label htmlFor="studio-item-app-store" className="mt-2 text-sm font-medium text-navy">
              App Store URL
            </label>
            <input
              id="studio-item-app-store"
              value={form.appStoreUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, appStoreUrl: e.target.value }))}
              className={fieldClasses}
              placeholder="https://apps.apple.com/…"
            />

            <label htmlFor="studio-item-github" className="mt-2 text-sm font-medium text-navy">
              GitHub URL
            </label>
            <input
              id="studio-item-github"
              value={form.githubUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, githubUrl: e.target.value }))}
              className={fieldClasses}
              placeholder="https://github.com/…"
            />
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-navy/8 bg-snow p-5 shadow-soft">
            <span className="text-sm font-medium text-navy">Cover Image</span>
            {form.coverMedia ? (
              <img src={form.coverMedia.url} alt="" className="aspect-video w-full rounded-2xl object-cover" />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-cloud text-slate/50">
                <ImagePlus size={24} />
              </div>
            )}
            <Button variant="secondary" onClick={() => setCoverPickerOpen(true)}>
              {form.coverMedia ? 'Change Cover' : 'Choose Cover'}
            </Button>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-navy/8 bg-snow p-5 shadow-soft">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-navy">Visible on the public site</span>
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => setForm((prev) => ({ ...prev, visible: e.target.checked }))}
                className="h-5 w-5 rounded border-navy/20 text-lake focus:ring-lake"
              />
            </label>

            <div className="flex flex-col gap-2">
              <label htmlFor="studio-item-sort-order" className="text-sm font-medium text-navy">
                Sort Order <span className="text-slate/60">(lower shows first)</span>
              </label>
              <input
                id="studio-item-sort-order"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                className={fieldClasses}
              />
            </div>
          </div>
        </div>
      </div>

      <MediaPicker
        open={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        accept="image"
        context={mediaContext}
        onSelect={(media) => setForm((prev) => ({ ...prev, coverMedia: media }))}
      />
    </div>
  )
}

export default StudioItemEditor
