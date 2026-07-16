import { createContext, useContext, useMemo, useRef } from 'react'

const InputContext = createContext(null)

/**
 * The single seam every input device passes through. Gameplay code
 * (Player.jsx, CameraController.jsx) only ever reads `moveRef`/`yawDeltaRef`
 * — it has no idea whether the current frame's input came from a keyboard, a
 * mouse, a touch joystick, or (later) a gamepad/VR controller/accessibility
 * device. Adding a new input method means writing a new "source" that calls
 * `registerMoveSource`/`registerLookSource` here; nothing else changes.
 *
 * Registration is a side-channel (a plain Set living in a ref), not React
 * state — mounting/unmounting a source (e.g. the touch joystick appearing on
 * a touch device) never triggers a re-render of the input plumbing itself.
 */
export function InputProvider({ children }) {
  const moveRef = useRef({ x: 0, z: 0 })
  const yawDeltaRef = useRef(0)
  const moveSourcesRef = useRef(new Set())
  const lookSourcesRef = useRef(new Set())
  const settingsRef = useRef({ sensitivity: 1, invertLook: false })

  const api = useMemo(
    () => ({
      moveRef,
      yawDeltaRef,
      settingsRef,
      moveSourcesRef,
      lookSourcesRef,
      registerMoveSource: (getVector) => {
        moveSourcesRef.current.add(getVector)
        return () => moveSourcesRef.current.delete(getVector)
      },
      registerLookSource: (drainDelta) => {
        lookSourcesRef.current.add(drainDelta)
        return () => lookSourcesRef.current.delete(drainDelta)
      },
    }),
    []
  )

  return <InputContext.Provider value={api}>{children}</InputContext.Provider>
}

export function useInput() {
  const context = useContext(InputContext)
  if (!context) throw new Error('useInput must be used within an InputProvider')
  return context
}
