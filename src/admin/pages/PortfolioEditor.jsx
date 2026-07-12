import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ImagePlus, Plus, X } from 'lucide-react'
import RichTextEditor from '../components/RichTextEditor/Editor'
import CategorySelect from '../components/CategorySelect'
import MediaPicker from '../components/MediaPicker'
import TagInput from '../components/TagInput'
import Button from '../../components/ui/Button'
import { slugify } from '../lib/slugify'
import { MAX_TITLE_LENGTH, isValidUrl } from '../lib/validation'
import { useToast } from '../hooks/useToast'
import {
  getPortfolioProject,
  createPortfolioProject,
  updatePortfolioProject,
  checkPortfolioSlugExists,
  setPortfolioMedia,
} from '../hooks/usePortfolio'

const fieldClasses =
  'w-full rounded-2xl border border-navy/12 bg-snow px-4 py-3 text-sm text-navy placeholder:text-slate/50 focus:border-lake focus:outline-none'

const AUTOSAVE_DELAY = 2000

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  content: null,
  categoryId: null,
  coverMedia: null,
  status: 'Planned',
  techStack: [],
  demoUrl: '',
  githubUrl: '',
  screenshots: [],
}

const PortfolioEditor = () => {
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [projectId, setProjectId] = useState(routeId ?? null)
  const [form, setForm] = useState(emptyForm)
  const [slugTouched, setSlugTouched] = useState(Boolean(routeId))
  const [loading, setLoading] = useState(Boolean(routeId))
  const [saveState, setSaveState] = useState('idle')
  const [coverPickerOpen, setCoverPickerOpen] = useState(false)
  const [screenshotPickerOpen, setScreenshotPickerOpen] = useState(false)
  const autosaveTimer = useRef(null)
  const skipNextAutosave = useRef(true)

  useEffect(() => {
    if (!routeId) return
    getPortfolioProject(routeId)
      .then((project) => {
        setForm({
          title: project.title,
          slug: project.slug,
          description: project.description ?? '',
          content: project.content,
          categoryId: project.category_id,
          coverMedia: project.cover_media,
          status: project.status,
          techStack: project.tech_stack ?? [],
          demoUrl: project.demo_url ?? '',
          githubUrl: project.github_url ?? '',
          screenshots: (project.portfolio_media ?? [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((pm) => pm.media),
        })
      })
      .catch(() => toast.error('Could not load this project.'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId])

  const buildPayload = (overrides = {}) => ({
    title: form.title.trim(),
    slug: slugify(form.slug || form.title),
    description: form.description.trim() || null,
    content: form.content,
    category_id: form.categoryId,
    cover_media_id: form.coverMedia?.id ?? null,
    status: form.status,
    tech_stack: form.techStack,
    demo_url: form.demoUrl.trim() || null,
    github_url: form.githubUrl.trim() || null,
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
    if (!isValidUrl(form.githubUrl.trim())) {
      toast.error('GitHub URL must be a valid http(s) link.')
      return null
    }

    const slug = slugify(form.slug || form.title)
    const duplicate = await checkPortfolioSlugExists(slug, projectId)
    if (duplicate) {
      toast.error('That slug is already in use by another project.')
      setSaveState('error')
      return null
    }

    setSaveState('saving')
    try {
      const payload = buildPayload(overrides)
      const saved = projectId
        ? await updatePortfolioProject(projectId, payload)
        : await createPortfolioProject(payload)

      const currentId = projectId ?? saved.id
      await setPortfolioMedia(currentId, form.screenshots.map((s) => s.id))

      if (!projectId) {
        setProjectId(saved.id)
        navigate(`/admin/portfolio/${saved.id}/edit`, { replace: true })
      }
      setSaveState('saved')
      return saved
    } catch (err) {
      toast.error(err.message ?? 'Could not save this project.')
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
    form.description,
    form.content,
    form.categoryId,
    form.coverMedia,
    form.status,
    form.techStack,
    form.demoUrl,
    form.githubUrl,
    form.screenshots,
  ])

  const handleTitleChange = (value) => {
    setForm((prev) => ({ ...prev, title: value, slug: slugTouched ? prev.slug : slugify(value) }))
  }

  if (loading) return <p className="text-sm text-slate">Loading…</p>

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">{projectId ? 'Edit Project' : 'New Project'}</h1>
          <p className="mt-1 text-xs text-slate">
            {saveState === 'saving' && 'Saving…'}
            {saveState === 'saved' && 'All changes saved'}
            {saveState === 'error' && 'Could not save — check the slug and try again'}
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
            placeholder="Project title"
            className="w-full rounded-2xl border border-navy/12 bg-snow px-5 py-4 text-xl font-semibold text-navy placeholder:text-slate/40 focus:border-lake focus:outline-none"
          />

          <div className="flex flex-col gap-2">
            <label htmlFor="project-description" className="text-sm font-medium text-navy">
              Short Description
            </label>
            <textarea
              id="project-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className={`${fieldClasses} resize-none`}
              placeholder="Shown on the portfolio card"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-navy">
              Full Write-up <span className="text-slate/60">(optional, for a future project detail page)</span>
            </span>
            <RichTextEditor
              content={form.content}
              uploadContext="portfolio"
              placeholder="Write more about this project…"
              onChange={(json) => setForm((prev) => ({ ...prev, content: json }))}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-navy">Screenshots</span>
            <div className="flex flex-wrap gap-3">
              {form.screenshots.map((shot) => (
                <div key={shot.id} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-navy/8">
                  <img src={shot.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, screenshots: prev.screenshots.filter((s) => s.id !== shot.id) }))
                    }
                    aria-label="Remove screenshot"
                    className="absolute right-1 top-1 rounded-full bg-navy/70 p-1 text-alpine opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setScreenshotPickerOpen(true)}
                className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-navy/15 text-slate hover:border-lake/40"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 rounded-3xl border border-navy/8 bg-snow p-5 shadow-soft">
            <label htmlFor="project-slug" className="text-sm font-medium text-navy">
              Slug
            </label>
            <input
              id="project-slug"
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
            </select>

            <label className="mt-2 text-sm font-medium text-navy">Category</label>
            <CategorySelect value={form.categoryId} onChange={(v) => setForm((prev) => ({ ...prev, categoryId: v }))} />

            <label className="mt-2 text-sm font-medium text-navy">Tech Stack</label>
            <TagInput value={form.techStack} onChange={(v) => setForm((prev) => ({ ...prev, techStack: v }))} />

            <label htmlFor="project-demo" className="mt-2 text-sm font-medium text-navy">
              Demo URL
            </label>
            <input
              id="project-demo"
              value={form.demoUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, demoUrl: e.target.value }))}
              className={fieldClasses}
              placeholder="https://…"
            />

            <label htmlFor="project-github" className="mt-2 text-sm font-medium text-navy">
              GitHub URL
            </label>
            <input
              id="project-github"
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
        </div>
      </div>

      <MediaPicker
        open={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        accept="image"
        context="portfolio"
        onSelect={(media) => setForm((prev) => ({ ...prev, coverMedia: media }))}
      />

      <MediaPicker
        open={screenshotPickerOpen}
        onClose={() => setScreenshotPickerOpen(false)}
        accept="image"
        context="portfolio"
        onSelect={(media) =>
          setForm((prev) =>
            prev.screenshots.some((s) => s.id === media.id) ? prev : { ...prev, screenshots: [...prev.screenshots, media] }
          )
        }
      />
    </div>
  )
}

export default PortfolioEditor
