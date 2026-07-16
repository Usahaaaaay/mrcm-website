import { supabase } from '../lib/supabase'
import { LOCATION_CATEGORIES } from '../lib/locationCategories'

const DESTINATION_COLUMNS = '*, destination_categories(category), destination_experiences(*)'
const CATEGORY_ORDER = LOCATION_CATEGORIES.map((c) => c.value)

// Supabase returns the nested join tables as raw arrays of rows
// (`destination_categories: [{category:'cafe'}, ...]`) in no particular order.
// Flatten that into the plain shape every consumer wants: `categories` sorted
// canonically (so `categories[0]` is a stable, deterministic "primary" category
// for marker icons/badge ordering) and `experiences` sorted by sort_order.
const normalizeDestination = (row) => {
  const { destination_categories, destination_experiences, ...rest } = row
  const categoryValues = (destination_categories ?? []).map((c) => c.category)
  const known = CATEGORY_ORDER.filter((value) => categoryValues.includes(value))
  const unknown = categoryValues.filter((value) => !known.includes(value))

  return {
    ...rest,
    categories: [...known, ...unknown],
    experiences: [...(destination_experiences ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  }
}

/** Public-facing: only visible destinations, no pagination (small single-region dataset). */
export async function listVisibleDestinations() {
  const { data, error } = await supabase
    .from('destinations')
    .select(DESTINATION_COLUMNS)
    .eq('visible', true)
    .order('name', { ascending: true })
  if (error) throw error
  return (data ?? []).map(normalizeDestination)
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Returns null (not a thrown error) when the id doesn't exist or isn't visible — a
 *  normal, expected outcome for a public detail page, not a failure. A malformed id
 *  (e.g. a stale or hand-typed URL) is treated the same way rather than reaching the
 *  database at all, since Postgres would otherwise reject a non-UUID value outright. */
export async function getVisibleDestination(id) {
  if (!UUID_PATTERN.test(id)) return null

  const { data, error } = await supabase
    .from('destinations')
    .select(DESTINATION_COLUMNS)
    .eq('id', id)
    .eq('visible', true)
    .maybeSingle()
  if (error) throw error
  return data ? normalizeDestination(data) : null
}

/** Admin-facing: every destination regardless of visibility, with search/category/pagination. */
export async function listDestinations({ search = '', category = 'all', from = 0, to = 19 } = {}) {
  let query = supabase
    .from('destinations')
    .select(category === 'all' ? DESTINATION_COLUMNS : '*, destination_categories!inner(category), destination_experiences(*)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`)
  if (category !== 'all') query = query.eq('destination_categories.category', category)

  const { data, count, error } = await query
  if (error) throw error
  return { rows: (data ?? []).map(normalizeDestination), count: count ?? 0 }
}

export async function getDestination(id) {
  const { data, error } = await supabase.from('destinations').select(DESTINATION_COLUMNS).eq('id', id).single()
  if (error) throw error
  return normalizeDestination(data)
}

export async function createDestination(payload) {
  const { data, error } = await supabase.from('destinations').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateDestination(id, payload) {
  const { data, error } = await supabase.from('destinations').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteDestination(id) {
  const { error } = await supabase.from('destinations').delete().eq('id', id)
  if (error) throw error
}

/** Replace-all: simplest correct way to persist a multi-select's current state. */
export async function setDestinationCategories(destinationId, categories) {
  const { error: deleteError } = await supabase
    .from('destination_categories')
    .delete()
    .eq('destination_id', destinationId)
  if (deleteError) throw deleteError

  if (categories.length === 0) return

  const { error: insertError } = await supabase
    .from('destination_categories')
    .insert(categories.map((category) => ({ destination_id: destinationId, category })))
  if (insertError) throw insertError
}

export async function listDestinationExperiences(destinationId) {
  const { data, error } = await supabase
    .from('destination_experiences')
    .select('*')
    .eq('destination_id', destinationId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createDestinationExperience(destinationId, payload, sortOrder) {
  const { data, error } = await supabase
    .from('destination_experiences')
    .insert({ ...payload, destination_id: destinationId, sort_order: sortOrder })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDestinationExperience(id, payload) {
  const { data, error } = await supabase.from('destination_experiences').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteDestinationExperience(id) {
  const { error } = await supabase.from('destination_experiences').delete().eq('id', id)
  if (error) throw error
}

/** Persists a new order after a drag-and-drop reorder — one update per row. */
export async function reorderDestinationExperiences(orderedIds) {
  await Promise.all(
    orderedIds.map((id, index) => supabase.from('destination_experiences').update({ sort_order: index }).eq('id', id))
  )
}
