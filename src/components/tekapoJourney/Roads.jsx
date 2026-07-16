import { memo, useMemo } from 'react'
import { ROADS } from './worldConfig'

const RoadSegment = ({ from, to, halfWidth }) => {
  const { center, length, angle } = useMemo(() => {
    const dx = to[0] - from[0]
    const dz = to[1] - from[1]
    return {
      center: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2],
      length: Math.hypot(dx, dz),
      angle: Math.atan2(dx, dz),
    }
  }, [from, to])

  return (
    <mesh position={[center[0], 0.03, center[1]]} rotation={[-Math.PI / 2, 0, angle]} receiveShadow>
      <planeGeometry args={[halfWidth * 2, length]} />
      <meshStandardMaterial color="#8b8f92" roughness={0.95} />
    </mesh>
  )
}

const Roads = () => (
  <>
    {ROADS.map((road, index) => (
      <RoadSegment key={index} {...road} />
    ))}
  </>
)

export default memo(Roads)
