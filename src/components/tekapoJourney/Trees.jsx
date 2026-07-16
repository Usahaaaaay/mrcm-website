import { memo, useMemo } from 'react'
import { Instances, Instance } from '@react-three/drei'
import { PLAYABLE_BOUNDS, isBlocked } from './worldConfig'

const TREE_COUNT = 220
const TRUNK_COLOR = '#8a6a4f'
const CANOPY_COLORS = ['#6fae6a', '#7fbf7a', '#5fa060']

// Small deterministic PRNG (mulberry32) so the scatter is stable across
// re-renders/reloads instead of jumping around every time the component mounts.
function mulberry32(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateTrees() {
  const random = mulberry32(1337)
  const trees = []

  while (trees.length < TREE_COUNT) {
    const x = (random() * 2 - 1) * PLAYABLE_BOUNDS
    const z = (random() * 2 - 1) * PLAYABLE_BOUNDS
    if (isBlocked(x, z)) continue

    trees.push({
      x,
      z,
      scale: 0.75 + random() * 0.6,
      rotation: random() * Math.PI * 2,
      canopyColorIndex: Math.floor(random() * CANOPY_COLORS.length),
    })
  }

  return trees
}

/**
 * All 220 trees render as 4 draw calls total (1 trunk instanced mesh + 3
 * canopy instanced meshes, split by color since instanced meshes share one
 * material) instead of 440 individual mesh draw calls — the single biggest
 * "minimize draw calls" win available, benefiting every device equally.
 */
const Trees = () => {
  const trees = useMemo(generateTrees, [])
  const treesByCanopyColor = useMemo(() => {
    const groups = CANOPY_COLORS.map(() => [])
    for (const tree of trees) groups[tree.canopyColorIndex].push(tree)
    return groups
  }, [trees])

  return (
    <>
      <Instances limit={TREE_COUNT} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.2, 6]} />
        <meshStandardMaterial color={TRUNK_COLOR} roughness={1} />
        {trees.map((tree, index) => (
          <Instance
            key={index}
            position={[tree.x, 0.6 * tree.scale, tree.z]}
            rotation={[0, tree.rotation, 0]}
            scale={tree.scale}
          />
        ))}
      </Instances>

      {CANOPY_COLORS.map((color, colorIndex) => (
        <Instances key={color} limit={Math.max(treesByCanopyColor[colorIndex].length, 1)} castShadow>
          <sphereGeometry args={[0.75, 8, 6]} />
          <meshStandardMaterial color={color} roughness={0.9} />
          {treesByCanopyColor[colorIndex].map((tree, index) => (
            <Instance
              key={index}
              position={[tree.x, 1.5 * tree.scale, tree.z]}
              rotation={[0, tree.rotation, 0]}
              scale={tree.scale}
            />
          ))}
        </Instances>
      ))}
    </>
  )
}

export default memo(Trees)
