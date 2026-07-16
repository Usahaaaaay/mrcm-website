import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { PerformanceMonitor } from '@react-three/drei'
import { useIsTouchDevice } from '../../hooks/useIsTouchDevice'
import { PLAYER_START } from './worldConfig'
import InputMerger from '../../input/InputMerger'
import KeyboardMoveSource from '../../input/sources/KeyboardMoveSource'
import MouseLookSource from '../../input/sources/MouseLookSource'
import Lighting from './Lighting'
import Environment from './Environment'
import Terrain from './Terrain'
import Lake from './Lake'
import Roads from './Roads'
import Trees from './Trees'
import Mountains from './Mountains'
import Buildings from './Buildings'
import Player from './Player'
import CameraController from './CameraController'

const QUALITY_TIERS = ['low', 'medium', 'high']

const stepTier = (tier, direction) => {
  const index = Math.min(Math.max(QUALITY_TIERS.indexOf(tier) + direction, 0), QUALITY_TIERS.length - 1)
  return QUALITY_TIERS[index]
}

/**
 * Orchestrates the scene. Player position and camera yaw live in refs here
 * (not React state) and are shared between Player and CameraController as
 * props, so following/orbiting never triggers a re-render — only useFrame
 * mutations. Raw device input is handled by InputMerger + one component per
 * device (KeyboardMoveSource/MouseLookSource here, VirtualJoystick/
 * TouchLookZone as DOM overlays in TekapoJourney.jsx); all of them share the
 * InputProvider rendered in TekapoJourney.jsx, above both this Canvas and
 * those overlays. Player/CameraController below only ever consume the merged
 * output. Adding future gameplay systems (NPCs, wildlife, weather) means
 * adding a sibling here; adding a new input device means adding a sibling
 * *source* — neither touches the other.
 */
const World = () => {
  const playerPosition = useRef(new THREE.Vector3(...PLAYER_START))
  const cameraYaw = useRef(0)
  const isTouch = useIsTouchDevice()
  const [qualityTier, setQualityTier] = useState(() => (isTouch ? 'medium' : 'high'))

  const performanceHandlers = useMemo(
    () => ({
      onIncline: () => setQualityTier((tier) => stepTier(tier, 1)),
      onDecline: () => setQualityTier((tier) => stepTier(tier, -1)),
    }),
    []
  )

  return (
    <PerformanceMonitor onIncline={performanceHandlers.onIncline} onDecline={performanceHandlers.onDecline}>
      <Lighting quality={qualityTier} />
      <Environment />
      <Terrain />
      <Lake />
      <Roads />
      <Trees />
      <Mountains />
      <Buildings />
      <Player positionRef={playerPosition} cameraYawRef={cameraYaw} />
      <CameraController targetRef={playerPosition} yawRef={cameraYaw} />
      <InputMerger />
      <KeyboardMoveSource />
      <MouseLookSource />
    </PerformanceMonitor>
  )
}

export default World
