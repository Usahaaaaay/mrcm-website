import { useCallback, useEffect, useState } from 'react'
import {
  listCollection,
  createCollectionItem,
  updateCollectionItem,
  deleteCollectionItem,
  reorderCollection,
} from '../../services/aboutService'

/**
 * One generic hook backing every About Me list section (skills, technologies,
 * social links, statistics, interests, fun facts, timeline) — same shape of
 * operations for all seven, so this replaces seven near-identical hooks.
 */
export function useAboutCollection(table) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(() => {
    setLoading(true)
    return listCollection(table)
      .then((data) => {
        setItems(data)
        setError(null)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [table])

  useEffect(() => {
    reload()
  }, [reload])

  const create = useCallback(
    async (payload) => {
      const nextSortOrder = items.length
      const created = await createCollectionItem(table, payload, nextSortOrder)
      setItems((prev) => [...prev, created])
      return created
    },
    [table, items.length]
  )

  const update = useCallback(
    async (id, payload) => {
      const updated = await updateCollectionItem(table, id, payload)
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
      return updated
    },
    [table]
  )

  const remove = useCallback(
    async (id) => {
      await deleteCollectionItem(table, id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    },
    [table]
  )

  const reorder = useCallback(
    async (orderedItems) => {
      setItems(orderedItems) // optimistic — reordering should feel instant
      await reorderCollection(
        table,
        orderedItems.map((item) => item.id)
      )
    },
    [table]
  )

  return { items, loading, error, reload, create, update, remove, reorder }
}
