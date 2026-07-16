import { memo } from 'react'
import { Html } from '@react-three/drei'
import { BUILDINGS } from './worldConfig'

const WALL_COLOR = '#f2e9d8'

const Building = ({ position, size, roofColor, label }) => {
  const [width, height, depth] = size
  const roofHeight = Math.min(width, depth) * 0.55

  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.9} />
      </mesh>

      <mesh position={[0, height + roofHeight / 2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[Math.hypot(width, depth) / 2, roofHeight, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.8} />
      </mesh>

      {label ? (
        <Html position={[0, height + roofHeight + 0.6, 0]} center distanceFactor={14} occlude>
          <div className="whitespace-nowrap rounded-full bg-alpine/90 px-3 py-1 text-xs font-medium text-navy shadow-soft">
            {label}
          </div>
        </Html>
      ) : null}
    </group>
  )
}

const Buildings = () => (
  <>
    {BUILDINGS.map((building, index) => (
      <Building key={index} {...building} />
    ))}
  </>
)

export default memo(Buildings)
