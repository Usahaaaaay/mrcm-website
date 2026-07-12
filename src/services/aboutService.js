import { supabase } from '../lib/supabase'

// `about` / `about_draft` are singletons — always exactly one row (seeded by
// migration, guarded by a `unique` constraint on `singleton`), so every read/
// write here targets that one row rather than an id the caller has to track.

export async function getPublishedAbout() {
  const { data, error } = await supabase.from('about').select('*').eq('singleton', true).single()
  if (error) throw error
  return data
}

export async function getDraftAbout() {
  const { data, error } = await supabase.from('about_draft').select('*').eq('singleton', true).single()
  if (error) throw error
  return data
}

export async function saveDraftAbout(payload) {
  const { data, error } = await supabase
    .from('about_draft')
    .update(payload)
    .eq('singleton', true)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Copies the draft document over the published one and stamps published_at. */
export async function publishAbout() {
  const draft = await getDraftAbout()
  // eslint-disable-next-line no-unused-vars
  const { id, singleton, created_at, updated_at, ...editable } = draft

  const { data, error } = await supabase
    .from('about')
    .update({ ...editable, published_at: new Date().toISOString() })
    .eq('singleton', true)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Reverts the draft back to whatever is currently published (discards unsaved edits). */
export async function discardDraft() {
  const published = await getPublishedAbout()
  // eslint-disable-next-line no-unused-vars
  const { id, singleton, published_at, created_at, updated_at, ...editable } = published

  const { data, error } = await supabase
    .from('about_draft')
    .update(editable)
    .eq('singleton', true)
    .select()
    .single()
  if (error) throw error
  return data
}

// ---------------------------------------------------------------------------
// Generic ordered-list collections (skills, technologies, social links,
// statistics, interests, fun facts, timeline) — same shape of operations for
// all seven, so one parameterized service instead of seven near-duplicates.
// ---------------------------------------------------------------------------

export async function listCollection(table) {
  const { data, error } = await supabase.from(table).select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createCollectionItem(table, payload, nextSortOrder) {
  const { data, error } = await supabase
    .from(table)
    .insert({ ...payload, sort_order: nextSortOrder })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCollectionItem(table, id, payload) {
  const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCollectionItem(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

/** Persists a new order after a drag-and-drop reorder — one update per row. */
export async function reorderCollection(table, orderedIds) {
  await Promise.all(
    orderedIds.map((id, index) => supabase.from(table).update({ sort_order: index }).eq('id', id))
  )
}
