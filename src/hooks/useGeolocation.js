import { useCallback, useState } from 'react'

/** status: 'idle' | 'locating' | 'granted' | 'denied' | 'unsupported' */
export function useGeolocation() {
  const [state, setState] = useState({ coords: null, status: 'idle' })

  // Returns a Promise so a click handler can `await` it and act on a real user
  // gesture (e.g. fly the map) — never throws, denial/unsupported just resolve
  // to null so the caller degrades gracefully instead of needing a try/catch.
  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ coords: null, status: 'unsupported' })
      return Promise.resolve(null)
    }

    setState((prev) => ({ ...prev, status: 'locating' }))

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude }
          setState({ coords, status: 'granted' })
          resolve(coords)
        },
        () => {
          setState({ coords: null, status: 'denied' })
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
      )
    })
  }, [])

  return { ...state, requestLocation }
}
