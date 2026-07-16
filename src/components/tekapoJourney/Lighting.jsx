import { memo } from 'react'
import { WORLD_HALF_SIZE } from './worldConfig'

const SHADOW_AREA = WORLD_HALF_SIZE * 0.7

const SHADOW_MAP_SIZE = { high: 2048, medium: 1024, low: 512 }

/** `quality` is driven by World.jsx's adaptive PerformanceMonitor — shadow
 *  resolution (and, on the lowest tier, a whole extra light) scale down
 *  automatically if a device can't sustain frame rate at full fidelity. */
const Lighting = ({ quality = 'high' }) => {
  const shadowMapSize = SHADOW_MAP_SIZE[quality] ?? SHADOW_MAP_SIZE.high

  return (
    <>
      <ambientLight intensity={0.65} color="#fff3e0" />
      <directionalLight
        position={[30, 40, 20]}
        intensity={1.4}
        color="#fff6e6"
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-left={-SHADOW_AREA}
        shadow-camera-right={SHADOW_AREA}
        shadow-camera-top={SHADOW_AREA}
        shadow-camera-bottom={-SHADOW_AREA}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-bias={-0.0005}
      />
      {/* Soft fill from the opposite side so shadowed faces never go fully
          black — dropped on the lowest tier since it's a whole extra light pass. */}
      {quality !== 'low' ? <directionalLight position={[-20, 15, -15]} intensity={0.25} color="#cfe8ff" /> : null}
    </>
  )
}

export default memo(Lighting)
