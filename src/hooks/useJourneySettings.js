import { useCallback, useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const STORAGE_KEY = 'tekapo-journey-settings'
const DEFAULT_SENSITIVITY = 1

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** Accessibility-facing preferences: sensitivity, invert-look, reduced motion.
 *  Persisted so a visitor who needs these doesn't have to re-set them every visit. */
export function useJourneySettings() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [settings, setSettings] = useState(() => {
    const stored = loadStored()
    return {
      sensitivity: stored?.sensitivity ?? DEFAULT_SENSITIVITY,
      invertLook: stored?.invertLook ?? false,
      reducedMotion: stored?.reducedMotion ?? prefersReducedMotion,
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Private browsing / storage quota — settings just won't persist.
    }
  }, [settings])

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  return { settings, updateSetting }
}
