import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * React Router doesn't scroll for you. This restores two behaviors visitors
 * expect: jumping to a section when a nav link points at `/#id` (even when
 * that means navigating in from a different page first), and resetting scroll
 * to the top on a plain route change.
 */
const ScrollManager = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 80)
      return () => clearTimeout(timer)
    }

    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

export default ScrollManager
