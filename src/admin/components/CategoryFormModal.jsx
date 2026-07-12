import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import Modal from './Modal'
import Button from '../../components/ui/Button'
import { slugify } from '../lib/slugify'
import { CATEGORY_ICON_OPTIONS, CATEGORY_COLOR_SWATCHES, CategoryIcon } from '../../lib/categoryIcons'
import { MAX_TITLE_LENGTH } from '../lib/validation'
import { checkCategoryNameExists, createCategory, updateCategory } from '../hooks/useCategories'
import { useToast } from '../hooks/useToast'

const fieldClasses =
  'w-full rounded-2xl border border-navy/12 bg-snow px-4 py-3 text-sm text-navy placeholder:text-slate/50 transition-colors duration-300 focus:border-lake focus:outline-none'

const emptyForm = { name: '', slug: '', description: '', icon: 'tag', color: CATEGORY_COLOR_SWATCHES[0] }

const CategoryFormModal = ({ open, onClose, category, onSaved }) => {
  const [form, setForm] = useState(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (open) {
      setForm(
        category
          ? {
              name: category.name,
              slug: category.slug,
              description: category.description ?? '',
              icon: category.icon ?? 'tag',
              color: category.color ?? CATEGORY_COLOR_SWATCHES[0],
            }
          : emptyForm
      )
      setSlugTouched(Boolean(category))
      setErrors({})
    }
  }, [open, category])

  const handleNameChange = (value) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Name is required.'
    if (!form.slug.trim()) nextErrors.slug = 'Slug is required.'

    if (Object.keys(nextErrors).length === 0) {
      const duplicate = await checkCategoryNameExists(form.name.trim(), category?.id)
      if (duplicate) nextErrors.name = 'A category with this name already exists.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: slugify(form.slug),
        description: form.description.trim() || null,
        icon: form.icon,
        color: form.color,
      }

      if (category) {
        await updateCategory(category.id, payload)
        toast.success('Category updated.')
      } else {
        await createCategory(payload)
        toast.success('Category created.')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={category ? 'Edit Category' : 'New Category'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="cat-name" className="text-sm font-medium text-navy">
            Name
          </label>
          <input
            id="cat-name"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            className={fieldClasses}
            placeholder="Photography"
          />
          {errors.name ? <p className="text-xs text-red-600">{errors.name}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="cat-slug" className="text-sm font-medium text-navy">
            Slug
          </label>
          <input
            id="cat-slug"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              setForm((prev) => ({ ...prev, slug: e.target.value }))
            }}
            className={fieldClasses}
            placeholder="photography"
          />
          {errors.slug ? <p className="text-xs text-red-600">{errors.slug}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="cat-description" className="text-sm font-medium text-navy">
            Description <span className="text-slate/60">(optional)</span>
          </label>
          <textarea
            id="cat-description"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className={`${fieldClasses} resize-none`}
            placeholder="A short description of this category"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-navy">Icon</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_ICON_OPTIONS.map((iconKey) => (
              <button
                key={iconKey}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, icon: iconKey }))}
                aria-label={iconKey}
                aria-pressed={form.icon === iconKey}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                  form.icon === iconKey
                    ? 'border-lake bg-lake-50 text-lake'
                    : 'border-navy/10 text-slate hover:border-lake/40'
                }`}
              >
                <CategoryIcon name={iconKey} size={17} strokeWidth={1.75} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-navy">Color</span>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORY_COLOR_SWATCHES.map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, color: swatch }))}
                aria-label={swatch}
                aria-pressed={form.color === swatch}
                style={{ backgroundColor: swatch }}
                className="relative h-8 w-8 rounded-full border border-navy/10"
              >
                {form.color === swatch ? (
                  <Check size={14} className="absolute inset-0 m-auto text-snow" strokeWidth={3} />
                ) : null}
              </button>
            ))}
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
              aria-label="Custom color"
              className="h-8 w-8 cursor-pointer rounded-full border border-navy/10 bg-transparent p-0"
            />
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving…' : category ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CategoryFormModal
