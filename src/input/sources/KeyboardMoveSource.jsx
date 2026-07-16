import { useEffect } from 'react'
import { useKeyboardControls } from '../../hooks/useKeyboardControls'
import { useInput } from '../InputContext'

/** Normalizes diagonal key combos (W+D) so they aren't faster than a single direction. */
const toVector = (keys) => {
  const x = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
  const z = (keys.backward ? 1 : 0) - (keys.forward ? 1 : 0)
  const length = Math.hypot(x, z)
  return length > 0 ? { x: x / length, z: z / length } : { x: 0, z: 0 }
}

/** Translates WASD/arrow keys into the shared move vocabulary. No visual output. */
const KeyboardMoveSource = () => {
  const keysRef = useKeyboardControls()
  const { registerMoveSource } = useInput()

  useEffect(() => registerMoveSource(() => toVector(keysRef.current)), [registerMoveSource, keysRef])

  return null
}

export default KeyboardMoveSource
