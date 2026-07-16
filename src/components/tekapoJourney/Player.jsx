import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { computeMoveVector, clampToBounds, dampAngle } from '../../utils/movement'
import { PLAYER_SPEED, PLAYABLE_BOUNDS, isInsideLake } from './worldConfig'
import { useInput } from '../../input/InputContext'
import { useJourneySettings } from '../../hooks/useJourneySettings'

const FACING_LAMBDA = 10
const FACING_LAMBDA_REDUCED_MOTION = 16

/**
 * Owns no React state — position lives in `positionRef` (shared with
 * CameraController via World.jsx) and is mutated directly inside useFrame.
 * Reads only `useInput().moveRef` — it has no idea whether that vector came
 * from a keyboard, a touch joystick, or anything else added later.
 */
const Player = ({ positionRef, cameraYawRef }) => {
  const groupRef = useRef(null)
  const facing = useRef(0)
  const { moveRef } = useInput()
  const { settings } = useJourneySettings()
  const reducedMotionRef = useRef(settings.reducedMotion)

  useEffect(() => {
    reducedMotionRef.current = settings.reducedMotion
  }, [settings.reducedMotion])

  useFrame((_, delta) => {
    const move = computeMoveVector(moveRef.current, cameraYawRef.current)

    if (move.lengthSq() > 0) {
      const position = positionRef.current
      const step = PLAYER_SPEED * delta
      const targetX = position.x + move.x * step
      const targetZ = position.z + move.z * step

      // Exact shoreline (margin 0) — the player should be able to walk right
      // up to the water's edge, not stop at the buffered margin used for
      // tree/road/building placement. Axis-separated so hitting the shore at
      // an angle slides along it instead of stopping dead, without any real
      // physics/vector-projection math.
      if (!isInsideLake(targetX, targetZ, 0)) {
        position.x = targetX
        position.z = targetZ
      } else if (!isInsideLake(targetX, position.z, 0)) {
        position.x = targetX
      } else if (!isInsideLake(position.x, targetZ, 0)) {
        position.z = targetZ
      }

      clampToBounds(position, PLAYABLE_BOUNDS)
      const lambda = reducedMotionRef.current ? FACING_LAMBDA_REDUCED_MOTION : FACING_LAMBDA
      facing.current = dampAngle(facing.current, Math.atan2(move.x, move.z), lambda, delta)
    }

    const group = groupRef.current
    if (group) {
      group.position.copy(positionRef.current)
      group.rotation.y = facing.current
    }
  })

  return (
    <group ref={groupRef}>
      <mesh castShadow position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.4, 0.7, 4, 8]} />
        <meshStandardMaterial color="#e08a3e" roughness={0.7} />
      </mesh>
    </group>
  )
}

export default Player
