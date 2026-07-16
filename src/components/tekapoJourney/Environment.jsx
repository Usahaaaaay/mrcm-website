import { memo } from 'react'
import { Sky } from '@react-three/drei'

// A single, clean atmosphere setup for now. Kept as its own component (rather
// than folded into Lighting) so a future day/night/weather system has one
// obvious place to grow into — swapping this out for a time-driven sky and
// dynamic fog won't touch Lighting, Terrain, or anything else.
const Environment = () => (
  <>
    <Sky sunPosition={[60, 45, 30]} turbidity={2} rayleigh={0.55} mieCoefficient={0.003} mieDirectionalG={0.7} />
    <fog attach="fog" args={['#cfe8ee', 70, 170]} />
  </>
)

export default memo(Environment)
