import { useEffect, useRef } from 'react'
import { useInput } from '../../input/InputContext'

// Deliberately gentler than desktop's mouse sensitivity (see MouseLookSource)
// — touch drags cover less physical distance than a mouse swipe, and a
// slower base rate keeps the camera feeling relaxed rather than twitchy, per
// the "calm, not a game" design goal. The user-adjustable sensitivity setting
// scales on top of this in InputMerger, same as it does for the mouse.
const TOUCH_LOOK_SENSITIVITY = 0.0015

/**
 * Invisible drag zone over the right half of the screen — one-finger drag
 * rotates the camera. Registers a look-delta source exactly like
 * MouseLookSource does; CameraController can't tell which one is active.
 */
const TouchLookZone = () => {
  const { registerLookSource } = useInput()
  const pendingDelta = useRef(0)
  const activePointerId = useRef(null)
  const lastPosition = useRef({ x: 0, y: 0 })

  useEffect(
    () =>
      registerLookSource(() => {
        const delta = pendingDelta.current
        pendingDelta.current = 0
        return delta
      }),
    [registerLookSource]
  )

  const handlePointerDown = (event) => {
    event.preventDefault()
    activePointerId.current = event.pointerId
    lastPosition.current = { x: event.clientX, y: event.clientY }
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // See VirtualJoystick.jsx — harmless if a browser rejects capture here.
    }
  }

  const handlePointerMove = (event) => {
    if (activePointerId.current !== event.pointerId) return
    event.preventDefault()
    const deltaX = event.clientX - lastPosition.current.x
    lastPosition.current = { x: event.clientX, y: event.clientY }
    pendingDelta.current -= deltaX * TOUCH_LOOK_SENSITIVITY
  }

  const release = (event) => {
    if (activePointerId.current !== event.pointerId) return
    activePointerId.current = null
  }

  return (
    <div
      className="absolute inset-y-0 right-0 w-1/2"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={release}
      onPointerCancel={release}
    />
  )
}

export default TouchLookZone
