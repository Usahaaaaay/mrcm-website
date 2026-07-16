import { useEffect, useRef, useState } from 'react'
import { useInput } from '../../input/InputContext'

const BASE_SIZE = 120
const KNOB_SIZE = 56
const MAX_OFFSET = (BASE_SIZE - KNOB_SIZE) / 2

/**
 * Bottom-left virtual joystick. Doubles as a move source: the knob's offset
 * *is* the move vector (smooth analog, not digital on/off like keyboard), so
 * pushing it halfway moves the player at half speed. Registers with the same
 * InputContext every other move source uses — Player.jsx has no idea this
 * exists.
 */
const VirtualJoystick = () => {
  const { registerMoveSource } = useInput()
  const vectorRef = useRef({ x: 0, z: 0 })
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 })
  const activePointerId = useRef(null)
  const baseRef = useRef(null)

  useEffect(() => registerMoveSource(() => vectorRef.current), [registerMoveSource])

  const updateFromPointer = (event) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    let dx = event.clientX - centerX
    let dy = event.clientY - centerY
    const distance = Math.hypot(dx, dy)
    if (distance > MAX_OFFSET) {
      dx = (dx / distance) * MAX_OFFSET
      dy = (dy / distance) * MAX_OFFSET
    }
    setKnobOffset({ x: dx, y: dy })
    // Screen space: up = forward (-z), right = +x — matches keyboard's convention.
    vectorRef.current = { x: dx / MAX_OFFSET, z: dy / MAX_OFFSET }
  }

  const handlePointerDown = (event) => {
    event.preventDefault()
    activePointerId.current = event.pointerId
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Some browsers reject capture for a pointer they don't consider active
      // yet — harmless here since pointermove/up are also handled if capture
      // silently fails, just without the "keeps tracking outside the element" guarantee.
    }
    updateFromPointer(event)
  }

  const handlePointerMove = (event) => {
    if (activePointerId.current !== event.pointerId) return
    event.preventDefault()
    updateFromPointer(event)
  }

  const release = (event) => {
    if (activePointerId.current !== event.pointerId) return
    activePointerId.current = null
    setKnobOffset({ x: 0, y: 0 })
    vectorRef.current = { x: 0, z: 0 }
  }

  return (
    <div
      ref={baseRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={release}
      onPointerCancel={release}
      className="absolute rounded-full bg-navy/25 backdrop-blur-sm"
      style={{
        width: BASE_SIZE,
        height: BASE_SIZE,
        left: 'max(1.5rem, env(safe-area-inset-left))',
        bottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        touchAction: 'none',
      }}
    >
      <div
        className="absolute rounded-full bg-alpine/85 shadow-soft"
        style={{
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${knobOffset.x}px), calc(-50% + ${knobOffset.y}px))`,
        }}
      />
    </div>
  )
}

export default VirtualJoystick
