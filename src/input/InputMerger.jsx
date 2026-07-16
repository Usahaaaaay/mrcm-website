import { useFrame } from '@react-three/fiber'
import { useInput } from './InputContext'

/**
 * The only place move/look merging happens. Rendered inside <Canvas> since it
 * needs useFrame. Sums every registered move source into one clamped vector
 * and every registered look source into one delta, applying the user's
 * sensitivity/invert preference exactly once, centrally — individual sources
 * never apply sensitivity themselves, so behavior stays consistent no matter
 * how many sources are active at once (e.g. keyboard + touch simultaneously).
 */
const InputMerger = () => {
  const { moveRef, yawDeltaRef, moveSourcesRef, lookSourcesRef, settingsRef } = useInput()

  useFrame(() => {
    let x = 0
    let z = 0
    for (const getVector of moveSourcesRef.current) {
      const vector = getVector()
      x += vector.x
      z += vector.z
    }
    const length = Math.hypot(x, z)
    if (length > 1) {
      x /= length
      z /= length
    }
    moveRef.current.x = x
    moveRef.current.z = z

    let yawDelta = 0
    for (const drainDelta of lookSourcesRef.current) {
      yawDelta += drainDelta()
    }
    const { sensitivity, invertLook } = settingsRef.current
    yawDeltaRef.current = yawDelta * sensitivity * (invertLook ? -1 : 1)
  })

  return null
}

export default InputMerger
