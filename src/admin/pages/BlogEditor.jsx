import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, UploadCloud, ImagePlus } from 'lucide-react'
import RichTextEditor from '../components/RichTextEditor/Editor'
import CategorySelect from '../components/CategorySelect'
import MediaPicker from '../components/MediaPicker'
import Button from '../../components/ui/Button'
import { slugify } from '../lib/slugify'
import { MAX_TITLE_LENGTH } from '../lib/validation'
import { useToast } from '../hooks/useToast'
import {
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  checkBlogSlugExists,
} from '../hooks/useBlogPosts'

const fieldClasses =
  'w-full rounded-2xl border border-navy/12 bg-snow px-4 py-3 text-sm text-navy placeholder:text-slate/50 focus:border-lake focus:outline-none'

const AUTOSAVE_DELAY = 2000

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: null,
  categoryId: null,
  coverMedia: null,
  status: 'draft',
  wordCount: 0,
  readingTimeMinutes: 0,
}

const BlogEditor = () => {
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [postId, setPostId] = useState(routeId ?? null)
  const [form, setForm] = useState(emptyForm)
  const [slugTouched, setSlugTouched] = useState(Boolean(routeId))
  const [loading, setLoading] = useState(Boolean(routeId))
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [pickerOpen, setPickerOpen] = useState(false)
  const autosaveTimer = useRef(null)
  const skipNextAutosave = useRef(true)

  useEffect(() => {
    if (!routeId) return
    getBlogPost(routeId)
      .then((post) => {
        setForm({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? '',
          content: post.content,
          categoryId: post.category_id,
          coverMedia: post.cover_media,
          status: post.status,
          wordCount: post.word_count,
          readingTimeMinutes: post.reading_time_minutes,
        })
      })
      .catch(() => toast.error('Could not load this post.'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId])

  const buildPayload = (overrides = {}) => ({
    title: form.title.trim(),
    slug: slugify(form.slug || form.title),
    excerpt: form.excerpt.trim() || null,
    content: form.content,
    category_id: form.categoryId,
    cover_media_id: form.coverMedia?.id ?? null,
    status: form.status,
    word_count: form.wordCount,
    reading_time_minutes: form.readingTimeMinutes,
    ...overrides,
  })

  const save = async (overrides = {}) => {
    // Cancel any pending debounced autosave before persisting. Without this,
    // an autosave scheduled before this call (its closure holding an older
    // `form.status`) can still fire afterward and silently overwrite a status
    // change made in the meantime — e.g. publishing, then having the stale
    // autosave revert the row back to "draft" moments later.
    clearTimeout(autosaveTimer.current)

    if (!form.title.trim()) {
      toast.error('Title is required.')
      return null
    }
    if (form.title.trim().length > MAX_TITLE_LENGTH) {
      toast.error(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`)
      return null
    }

    const slug = slugify(form.slug || form.title)
    const duplicate = await checkBlogSlugExists(slug, postId)
    if (duplicate) {
      toast.error('That slug is already in use by another post.')
      setSaveState('error')
      return null
    }

    setSaveState('saving')
    try {
      const payload = buildPayload(overrides)
      const saved = postId ? await updateBlogPost(postId, payload) : await createBlogPost(payload)
      if (!postId) {
        setPostId(saved.id)
        navigate(`/admin/blog/${saved.id}/edit`, { replace: true })
      }
      setSaveState('saved')
      return saved
    } catch (err) {
      toast.error(err.message ?? 'Could not save this post.')
      setSaveState('error')
      return null
    }
  }

  // Debounced autosave whenever the form changes (skips the very first render/load).
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
  }, [form.title, form.slug, form.excerpt, form.content, form.categoryId, form.coverMedia])

  const handleTitleChange = (value) => {
    setForm((prev) => ({ ...prev, title: value, slug: slugTouched ? prev.slug : slugify(value) }))
  }

  const handlePublishToggle = async () => {
    const nextStatus = form.status === 'published' ? 'draft' : 'published'
    setForm((prev) => ({ ...prev, status: nextStatus }))
    const saved = await save({
      status: nextStatus,
      published_at: nextStatus === 'published' ? new Date().toISOString() : null,
    })
    if (saved) toast.success(nextStatus === 'published' ? 'Post published.' : 'Post unpublished.')
  }

  if (loading) {
    return <p className="text-sm text-slate">Loading…</p>
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">{postId ? 'Edit Post' : 'New Blog Post'}</h1>
          <p className="mt-1 text-xs text-slate">
            {saveState === 'saving' && 'Saving…'}
            {saveState === 'saved' && 'All changes saved'}
            {saveState === 'error' && 'Could not save — check the slug and try again'}
            {saveState === 'idle' && 'Autosaves as you type'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Save} onClick={() => save()}>
            Save Draft
          </Button>
          <Button icon={UploadCloud} onClick={handlePublishToggle}>
            {form.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-5">
          <input
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            placeholder="Post title"
            className="w-full rounded-2xl border border-navy/12 bg-snow px-5 py-4 text-xl font-semibold text-navy placeholder:text-slate/40 focus:border-lake focus:outline-none"
          />

          <RichTextEditor
            content={form.content}
            uploadContext="blog"
            placeholder="Tell your story…"
            onChange={(json, meta) =>
              setForm((prev) => ({
                ...prev,
                content: json,
                wordCount: meta.wordCount,
                readingTimeMinutes: meta.readingTimeMinutes,
              }))
            }
          />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 rounded-3xl border border-navy/8 bg-snow p-5 shadow-soft">
            <label htmlFor="post-slug" className="text-sm font-medium text-navy">
              Slug
            </label>
            <input
              id="post-slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                setForm((prev) => ({ ...prev, slug: e.target.value }))
              }}
              className={fieldClasses}
            />

            <label htmlFor="post-excerpt" className="mt-2 text-sm font-medium text-navy">
              Excerpt
            </label>
            <textarea
              id="post-excerpt"
              rows={3}
              value={form.excerpt}
              onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
              className={`${fieldClasses} resize-none`}
              placeholder="A short preview shown on the blog list"
            />

            <label className="mt-2 text-sm font-medium text-navy">Category</label>
            <CategorySelect value={form.categoryId} onChange={(v) => setForm((prev) => ({ ...prev, categoryId: v }))} />
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
            <Button variant="secondary" onClick={() => setPickerOpen(true)}>
              {form.coverMedia ? 'Change Cover' : 'Choose Cover'}
            </Button>
          </div>
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        accept="image"
        context="blog"
        onSelect={(media) => setForm((prev) => ({ ...prev, coverMedia: media }))}
      />
    </div>
  )
}

export default BlogEditor
