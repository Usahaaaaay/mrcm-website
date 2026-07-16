import { useEffect, useState } from 'react'

const QUERY = '(pointer: coarse)'

const detectTouch = () =>
  (typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches) ||
  (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)

/** Reactive so a convertible device (or DevTools device toolbar) switching
 *  input mode mid-session updates which controls render. */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(detectTouch)

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY)
    const handleChange = () => setIsTouch(detectTouch())
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isTouch
}
