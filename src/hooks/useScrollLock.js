import { useEffect } from 'react'

export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return
    const { overflow, overscrollBehavior } = document.body.style
    document.body.style.overflow = 'hidden'
    // overflow:hidden alone doesn't stop Chrome/Samsung Internet's
    // pull-to-refresh gesture recognizer — that's a separate code path this
    // property specifically addresses.
    document.body.style.overscrollBehavior = 'none'
    return () => {
      document.body.style.overflow = overflow
      document.body.style.overscrollBehavior = overscrollBehavior
    }
  }, [locked])
}
