import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useInput } from '../../input/InputContext'
import { useJourneySettings } from '../../hooks/useJourneySettings'

const FOLLOW_DISTANCE = 7
const FOLLOW_HEIGHT = 3.4
const LOOK_HEIGHT = 1.2
const MIN_CAMERA_Y = 1.5
const FOLLOW_LAMBDA = 4
const FOLLOW_LAMBDA_REDUCED_MOTION = 8

// Scratch objects reused every frame instead of allocating new THREE.Vector3
// instances inside useFrame.
const desiredPosition = new THREE.Vector3()
const lookTarget = new THREE.Vector3()

/**
 * A fixed-distance orbit camera, not a free-fly camera: it always sits
 * `FOLLOW_DISTANCE` behind the player at a fixed height/angle. Reads only
 * `useInput().yawDeltaRef` — every device-specific concern (Pointer Lock,
 * touch drag, any future input method) lives in an input source elsewhere;
 * this component only ever integrates an already-merged delta into an orbit
 * angle, exactly as it did before touch support existed.
 */
const CameraController = ({ targetRef, yawRef }) => {
  const { camera } = useThree()
  const { yawDeltaRef } = useInput()
  const { settings } = useJourneySettings()
  const reducedMotionRef = useRef(settings.reducedMotion)

  useEffect(() => {
    reducedMotionRef.current = settings.reducedMotion
  }, [settings.reducedMotion])

  useEffect(() => {
    camera.position.set(0, FOLLOW_HEIGHT, targetRef.current.z + FOLLOW_DISTANCE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((_, delta) => {
    yawRef.current += yawDeltaRef.current

    const target = targetRef.current
    const yaw = yawRef.current

    desiredPosition.set(
      target.x + Math.sin(yaw) * FOLLOW_DISTANCE,
      Math.max(target.y + FOLLOW_HEIGHT, MIN_CAMERA_Y),
      target.z + Math.cos(yaw) * FOLLOW_DISTANCE
    )

    const lambda = reducedMotionRef.current ? FOLLOW_LAMBDA_REDUCED_MOTION : FOLLOW_LAMBDA
    const smoothing = 1 - Math.exp(-lambda * delta)
    camera.position.lerp(desiredPosition, smoothing)

    lookTarget.set(target.x, target.y + LOOK_HEIGHT, target.z)
    camera.lookAt(lookTarget)
  })

  return null
}

export default CameraController
