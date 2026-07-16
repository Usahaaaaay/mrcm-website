import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY)
    const handleChange = (event) => setPrefersReduced(event.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReduced
}
