import { useEffect, useState } from 'react'
import { fetchEnvironment } from '../lib/environment/fetchEnvironment'
import { deriveEnvironment } from '../lib/environment/deriveEnvironment'

/**
 * @typedef {import('../types/environment.js').EnvironmentState} EnvironmentState
 */

// Live weather doesn't change fast enough to justify tighter polling, and
// Open-Meteo's own forecast model updates on a similar cadence.
const REFRESH_INTERVAL_MS = 12 * 60 * 1000 // 12 minutes

/**
 * The single source of truth for the Hero's Lake Tekapo scene. Components
 * call this to get the current EnvironmentState — they never fetch or
 * derive it themselves. Backed by the Environment Engine: fetchEnvironment()
 * (Open-Meteo) feeds deriveEnvironment(), whose output is what's returned.
 *
 * Fetches on mount, then again every REFRESH_INTERVAL_MS. If a fetch fails
 * (network error, non-OK response, ...), the previously-derived
 * EnvironmentState is left on screen unchanged — `error` is set so a
 * caller *could* surface it, but the scene itself never blanks or reverts.
 *
 * There's intentionally no cross-render request-deduplication guard: this
 * hook has exactly one effect, called from exactly one consumer (Hero), so
 * there's no path that could produce overlapping requests other than a
 * fetch outliving the 12-minute interval — guarded below with a plain
 * closure flag scoped to that effect instance. If a second consumer needs
 * this data later, that's the point to promote it to a shared context
 * (see the note in Hero.jsx) rather than adding cross-instance guarding now.
 *
 * @returns {{ environment: EnvironmentState, loading: boolean, error: Error | null }}
 */
export function useEnvironmentState() {
  const [environment, setEnvironment] = useState(() => deriveEnvironment(null))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    let inFlight = false
    const controller = new AbortController()

    async function refresh() {
      if (inFlight) return
      inFlight = true
      try {
        const raw = await fetchEnvironment({ signal: controller.signal })
        if (cancelled) return
        setEnvironment(deriveEnvironment(raw))
        setError(null)
      } catch (err) {
        if (cancelled || err.name === 'AbortError') return
        // Deliberately not touching `environment` here — see the doc
        // comment above. The stale-but-valid scene stays on screen.
        setError(err)
      } finally {
        if (!cancelled) setLoading(false)
        inFlight = false
      }
    }

    refresh()
    const intervalId = setInterval(refresh, REFRESH_INTERVAL_MS)

    return () => {
      cancelled = true
      controller.abort()
      clearInterval(intervalId)
    }
  }, [])

  return { environment, loading, error }
}
