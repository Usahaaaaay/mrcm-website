import { useEffect, useState } from 'react'
import { ImagePlus, Plus, X } from 'lucide-react'
import Modal from './Modal'
import Button from '../../components/ui/Button'
import MediaPicker from './MediaPicker'
import LocationCoordinatePicker from './LocationCoordinatePicker'
import SortableList from './about/SortableList'
import { getGroupedLocationCategories } from '../../lib/locationCategories'
import { MAX_TITLE_LENGTH } from '../lib/validation'
import { createDestination, updateDestination, setDestinationCategories } from '../../services/destinationService'
import { useDestinationExperiences } from '../hooks/useDestinations'
import { useToast } from '../hooks/useToast'

const fieldClasses =
  'w-full rounded-2xl border border-navy/12 bg-snow px-4 py-3 text-sm text-navy placeholder:text-slate/50 focus:border-lake focus:outline-none'

const groupedCategories = getGroupedLocationCategories()

const emptyForm = {
  name: '',
  description: '',
  address: '',
  latitude: '',
  longitude: '',
  imageUrl: '',
  visible: true,
  categories: [],
}

const DestinationFormModal = ({ open, onClose, destination, onSaved }) => {
  const [form, setForm] = useState(emptyForm)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (open) {
      setForm(
        destination
          ? {
              name: destination.name,
              description: destination.description ?? '',
              address: destination.address ?? '',
              latitude: String(destination.latitude),
              longitude: String(destination.longitude),
              imageUrl: destination.image_url ?? '',
              visible: destination.visible,
              categories: destination.categories ?? [],
            }
          : emptyForm
      )
    }
  }, [open, destination])

  const toggleCategory = (value) =>
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(value)
        ? prev.categories.filter((c) => c !== value)
        : [...prev.categories, value],
    }))

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.name.trim()) {
      toast.error('Name is required.')
      return
    }
    if (form.name.trim().length > MAX_TITLE_LENGTH) {
      toast.error(`Name must be ${MAX_TITLE_LENGTH} characters or fewer.`)
      return
    }
    const lat = Number.parseFloat(form.latitude)
    const lng = Number.parseFloat(form.longitude)
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error('Latitude and longitude must both be valid numbers.')
      return
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Latitude must be between -90 and 90, longitude between -180 and 180.')
      return
    }
    if (form.categories.length === 0) {
      toast.error('Select at least one category.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        address: form.address.trim() || null,
        latitude: lat,
        longitude: lng,
        image_url: form.imageUrl || null,
        visible: form.visible,
      }

      const destinationId = destination
        ? (await updateDestination(destination.id, payload)).id
        : (await createDestination(payload)).id

      await setDestinationCategories(destinationId, form.categories)

      toast.success(destination ? 'Destination updated.' : 'Destination created.')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message ?? 'Could not save this destination.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={destination ? 'Edit Destination' : 'Add Destination'}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="dest-name" className="text-sm font-medium text-navy">
            Name
          </label>
          <input
            id="dest-name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            maxLength={MAX_TITLE_LENGTH}
            className={fieldClasses}
            placeholder="GO Tekapo"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-navy">Categories</span>
          <p className="text-xs text-slate">Everything this destination offers — select all that apply.</p>
          <div className="flex flex-col gap-3">
            {groupedCategories.map(({ group, categories }) => (
              <div key={group}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate/60">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon
                    const isActive = form.categories.includes(category.value)
                    return (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => toggleCategory(category.value)}
                        aria-pressed={isActive}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                          isActive
                            ? 'border-transparent text-snow shadow-soft'
                            : 'border-navy/12 bg-snow text-slate hover:border-lake/30 hover:text-navy'
                        }`}
                        style={isActive ? { backgroundColor: category.color } : undefined}
                      >
                        <Icon size={12} strokeWidth={2} />
                        {category.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="dest-description" className="text-sm font-medium text-navy">
            Description
          </label>
          <textarea
            id="dest-description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className={`${fieldClasses} resize-none`}
            placeholder="A short description shown on the guide"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="dest-address" className="text-sm font-medium text-navy">
            Address
          </label>
          <input
            id="dest-address"
            value={form.address}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            className={fieldClasses}
            placeholder="2 Pioneer Drive, Lake Tekapo"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="dest-lat" className="text-sm font-medium text-navy">
              Latitude
            </label>
            <input
              id="dest-lat"
              value={form.latitude}
              onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
              className={fieldClasses}
              placeholder="-44.0068"
              inputMode="decimal"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="dest-lng" className="text-sm font-medium text-navy">
              Longitude
            </label>
            <input
              id="dest-lng"
              value={form.longitude}
              onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
              className={fieldClasses}
              placeholder="170.4779"
              inputMode="decimal"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-navy">
            Pick on map <span className="text-slate/60">(optional — click or drag the pin)</span>
          </span>
          <LocationCoordinatePicker
            latitude={Number.parseFloat(form.latitude) || null}
            longitude={Number.parseFloat(form.longitude) || null}
            category={form.categories[0]}
            onChange={({ lat, lng }) =>
              setForm((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }))
            }
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-navy">Featured Image</span>
          {form.imageUrl ? (
            <img src={form.imageUrl} alt="" className="aspect-video w-full rounded-2xl object-cover" />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-cloud text-slate/50">
              <ImagePlus size={24} />
            </div>
          )}
          <Button type="button" variant="secondary" onClick={() => setPickerOpen(true)}>
            {form.imageUrl ? 'Change Image' : 'Choose Image'}
          </Button>
        </div>

        <label className="flex items-center gap-2.5 text-sm font-medium text-navy">
          <input
            type="checkbox"
            checked={form.visible}
            onChange={(e) => setForm((prev) => ({ ...prev, visible: e.target.checked }))}
            className="h-4 w-4 rounded border-navy/20 accent-lake"
          />
          Visible on the public guide
        </label>

        {destination ? (
          <ExperiencesEditor destinationId={destination.id} />
        ) : (
          <p className="rounded-2xl border border-navy/8 bg-cloud/40 px-4 py-3 text-xs text-slate">
            Save this destination first, then reopen it to add its individual experiences (e.g. "Glacier Explorer",
            "Hot Pools").
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving…' : destination ? 'Save Changes' : 'Create Destination'}
          </Button>
        </div>
      </form>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        accept="image"
        context="destination"
        onSelect={(media) => setForm((prev) => ({ ...prev, imageUrl: media.url }))}
      />
    </Modal>
  )
}

const experienceFieldClasses =
  'flex-1 rounded-xl border border-navy/12 bg-snow px-3 py-2 text-sm text-navy focus:border-lake focus:outline-none'

const ExperiencesEditor = ({ destinationId }) => {
  const { items, loading, create, update, remove, reorder } = useDestinationExperiences(destinationId)
  const [draftName, setDraftName] = useState('')
  const toast = useToast()

  const handleAdd = async (event) => {
    event.preventDefault()
    if (!draftName.trim()) return
    try {
      await create({ name: draftName.trim() })
      setDraftName('')
    } catch (err) {
      toast.error(err.message ?? 'Could not add experience.')
    }
  }

  const handleRename = async (id, name, previous) => {
    if (name === previous || !name.trim()) return
    try {
      await update(id, { name: name.trim() })
    } catch (err) {
      toast.error(err.message ?? 'Could not update experience.')
    }
  }

  const handleCategoryChange = async (id, category) => {
    try {
      await update(id, { category: category || null })
    } catch (err) {
      toast.error(err.message ?? 'Could not update experience.')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-navy">Experiences</span>
      <p className="text-xs text-slate">
        Everything a visitor can actually do here — reorder by dragging, edits save when you click away.
      </p>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="Add an experience…"
          className={experienceFieldClasses}
        />
        <Button type="submit" variant="secondary" icon={Plus}>
          Add
        </Button>
      </form>

      {loading ? (
        <p className="py-4 text-center text-sm text-slate">Loading…</p>
      ) : (
        <SortableList
          items={items}
          onReorder={reorder}
          emptyLabel="No experiences yet."
          renderItem={(item) => (
            <div className="flex items-center gap-2 rounded-xl border border-navy/8 bg-cloud/40 px-3 py-2.5">
              <input
                defaultValue={item.name}
                onBlur={(e) => handleRename(item.id, e.target.value, item.name)}
                className="flex-1 bg-transparent text-sm text-navy focus:outline-none"
              />
              <select
                defaultValue={item.category ?? ''}
                onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                className="rounded-lg border border-navy/12 bg-snow px-2 py-1 text-xs text-navy focus:border-lake focus:outline-none"
              >
                <option value="">No icon</option>
                {groupedCategories.map(({ group, categories }) => (
                  <optgroup key={group} label={group}>
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
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
    </div>
  )
}

export default DestinationFormModal
