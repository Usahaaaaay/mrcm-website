import { useEffect, useRef } from 'react'

const KEY_MAP = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
}

/**
 * Returns a stable ref — not React state — since movement input is read every
 * frame inside useFrame. Driving it through setState would re-render the
 * whole component tree on every key press for data that only ever needs to
 * be read imperatively.
 */
export function useKeyboardControls() {
  const movement = useRef({ forward: false, backward: false, left: false, right: false })

  useEffect(() => {
    const handleKeyDown = (event) => {
      const action = KEY_MAP[event.code]
      if (action) movement.current[action] = true
    }
    const handleKeyUp = (event) => {
      const action = KEY_MAP[event.code]
      if (action) movement.current[action] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return movement
}
