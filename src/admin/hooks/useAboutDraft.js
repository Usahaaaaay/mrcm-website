import { useCallback, useEffect, useRef, useState } from 'react'
import { getDraftAbout, getPublishedAbout, saveDraftAbout, publishAbout, discardDraft } from '../../services/aboutService'

const AUTOSAVE_INTERVAL = 30_000

const EDITABLE_KEYS_EXCLUDE = new Set(['id', 'singleton', 'created_at', 'updated_at', 'published_at'])

const toEditable = (row) =>
  Object.fromEntries(Object.entries(row).filter(([key]) => !EDITABLE_KEYS_EXCLUDE.has(key)))

/**
 * Loads the draft "profile document," tracks unsaved local edits, autosaves
 * every 30s while dirty, and exposes Publish/Discard. `about_draft` is the
 * only thing this ever writes to — Publish/Discard are the only paths that
 * touch the live `about` table.
 */
export function useAboutDraft() {
  const [form, setForm] = useState(null)
  const [publishedAt, setPublishedAt] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const formRef = useRef(form)
  const dirtyRef = useRef(dirty)
  formRef.current = form
  dirtyRef.current = dirty

  useEffect(() => {
    let cancelled = false
    Promise.all([getDraftAbout(), getPublishedAbout()])
      .then(([draft, published]) => {
        if (cancelled) return
        setForm(toEditable(draft))
        setPublishedAt(published.published_at)
        setLastSavedAt(draft.updated_at)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const updateField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }, [])

  const updateFields = useCallback((patch) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setDirty(true)
  }, [])

  const save = useCallback(async () => {
    if (!formRef.current) return
    setSaveState('saving')
    try {
      const saved = await saveDraftAbout(formRef.current)
      setDirty(false)
      setLastSavedAt(saved.updated_at)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [])

  // Autosave every 30s while there are unsaved edits.
  useEffect(() => {
    const timer = setInterval(() => {
      if (dirtyRef.current) save()
    }, AUTOSAVE_INTERVAL)
    return () => clearInterval(timer)
  }, [save])

  const publish = useCallback(async () => {
    if (dirtyRef.current) await save()
    const published = await publishAbout()
    setPublishedAt(published.published_at)
    return published
  }, [save])

  const discard = useCallback(async () => {
    const reverted = await discardDraft()
    setForm(toEditable(reverted))
    setDirty(false)
    setLastSavedAt(reverted.updated_at)
  }, [])

  return {
    form,
    updateField,
    updateFields,
    dirty,
    loading,
    loadError,
    saveState,
    lastSavedAt,
    publishedAt,
    save,
    publish,
    discard,
  }
}
