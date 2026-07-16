import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useInput } from '../InputContext'

const MOUSE_SENSITIVITY = 0.0025

/**
 * Desktop mouse look via Pointer Lock. Translates raw movementX into the
 * shared look-delta vocabulary — CameraController never knows Pointer Lock
 * exists. Rendered inside <Canvas> since it needs the canvas DOM element.
 */
const MouseLookSource = () => {
  const { gl } = useThree()
  const { registerLookSource } = useInput()
  const pendingDelta = useRef(0)

  useEffect(
    () =>
      registerLookSource(() => {
        const delta = pendingDelta.current
        pendingDelta.current = 0
        return delta
      }),
    [registerLookSource]
  )

  useEffect(() => {
    const canvas = gl.domElement

    const handlePointerMove = (event) => {
      if (document.pointerLockElement !== canvas) return
      pendingDelta.current -= event.movementX * MOUSE_SENSITIVITY
    }

    const handleClick = () => {
      if (document.pointerLockElement !== canvas) canvas.requestPointerLock()
    }

    // The browser already exits Pointer Lock on Escape on its own (mandatory
    // per spec) — this is an explicit backup, not something relied on blindly.
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && document.pointerLockElement === canvas) {
        document.exitPointerLock()
      }
    }

    canvas.addEventListener('click', handleClick)
    document.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      canvas.removeEventListener('click', handleClick)
      document.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [gl])

  return null
}

export default MouseLookSource
