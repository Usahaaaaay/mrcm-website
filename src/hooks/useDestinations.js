import { useEffect, useState } from 'react'
import { listVisibleDestinations } from '../services/destinationService'

/** Public guide page: fetch every visible destination once; search/filter happens client-side. */
export function useDestinations() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    listVisibleDestinations()
      .then((data) => {
        if (!cancelled) setDestinations(data)
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
  }, [])

  return { destinations, loading, error }
}
