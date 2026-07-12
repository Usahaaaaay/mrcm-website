import { useEffect } from 'react'

/** Warns before closing/refreshing the tab while there are unsaved draft edits. */
const UnsavedChangesGuard = ({ when }) => {
  useEffect(() => {
    if (!when) return
    const handler = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [when])

  return null
}

export default UnsavedChangesGuard
