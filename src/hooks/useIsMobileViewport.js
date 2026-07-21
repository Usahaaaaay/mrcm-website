import { useEffect, useState } from 'react'

// Matches Tailwind's default `md` breakpoint (768px), already used throughout
// the guide feature (e.g. BottomDrawer's `md:hidden`) so this stays in sync
// with the same viewport boundary rather than introducing a second one.
const QUERY = '(max-width: 767.98px)'

const detectMobile = () => typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches

/** Reactive so resizing the window or rotating a device updates which
 *  scroll-lock behavior applies, the same pattern as useIsTouchDevice. */
export function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(detectMobile)

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY)
    const handleChange = () => setIsMobile(detectMobile())
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}
