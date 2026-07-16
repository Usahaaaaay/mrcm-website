import { memo, useMemo } from 'react'
import * as THREE from 'three'
import { MOUNTAIN_RANGES } from './mountainData'
import { buildLayerGeometry } from './mountainGenerator'

const LAYERS = ['near', 'far']

/**
 * Static, data-driven mountain skyline (Phase 3) — replaces the old
 * randomly-scattered cone ring. Two merged meshes total (one per depth
 * layer: near foothills, far snow-capped range), built once from
 * MOUNTAIN_RANGES via mountainGenerator and never recomputed — no
 * per-frame work, no runtime randomness. Vertex colors let every named
 * range in a layer (e.g. Two Thumb, the southern filler hills, and Ben
 * Ohau, all on the "near" layer) share a single draw call despite each
 * having its own color, so the whole system costs 2 draw calls total.
 */
const Mountains = () => {
  const geometries = useMemo(
    () => LAYERS.map((layer) => buildLayerGeometry(MOUNTAIN_RANGES.filter((range) => range.layer === layer), layer)),
    []
  )

  return (
    <>
      {geometries.map((geometry, index) => (
        <mesh key={LAYERS[index]} geometry={geometry} receiveShadow>
          {/* DoubleSide for the same reason as Lake.jsx: confirming exact
              winding order for a hand-authored, asymmetric ridgeline is
              easy to get backwards, and this guards against it at
              negligible cost for two simple opaque low-poly meshes. */}
          <meshStandardMaterial vertexColors flatShading roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

export default memo(Mountains)
