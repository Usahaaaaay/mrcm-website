import { useCallback, useEffect, useState } from 'react'
import {
  listDestinations,
  listDestinationExperiences,
  createDestinationExperience,
  updateDestinationExperience,
  deleteDestinationExperience,
  reorderDestinationExperiences,
} from '../../services/destinationService'

export function useAdminDestinations({ search = '', category = 'all', from = 0, to = 9 } = {}) {
  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    listDestinations({ search, category, from, to })
      .then(({ rows: data, count: total }) => {
        if (cancelled) return
        setRows(data)
        setCount(total)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [search, category, from, to, reloadKey])

  return { rows, count, loading, error, reload }
}

/**
 * CRUD + reorder for one destination's experiences — same shape as
 * useAboutCollection (src/admin/hooks/useAboutCollections.js), but scoped by
 * destinationId since experiences are parent-scoped, not a global singleton
 * collection. Written directly for this one use case rather than generalizing
 * useAboutCollection into a multi-parent abstraction it doesn't need yet.
 */
export function useDestinationExperiences(destinationId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(() => {
    if (!destinationId) {
      setItems([])
      setLoading(false)
      return Promise.resolve()
    }
    setLoading(true)
    return listDestinationExperiences(destinationId)
      .then((data) => {
        setItems(data)
        setError(null)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [destinationId])

  useEffect(() => {
    reload()
  }, [reload])

  const create = useCallback(
    async (payload) => {
      const nextSortOrder = items.length
      const created = await createDestinationExperience(destinationId, payload, nextSortOrder)
      setItems((prev) => [...prev, created])
      return created
    },
    [destinationId, items.length]
  )

  const update = useCallback(async (id, payload) => {
    const updated = await updateDestinationExperience(id, payload)
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
    return updated
  }, [])

  const remove = useCallback(async (id) => {
    await deleteDestinationExperience(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const reorder = useCallback(async (orderedItems) => {
    setItems(orderedItems) // optimistic — reordering should feel instant
    await reorderDestinationExperiences(orderedItems.map((item) => item.id))
  }, [])

  return { items, loading, error, reload, create, update, remove, reorder }
}
