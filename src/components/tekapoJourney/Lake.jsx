import { memo, useMemo } from 'react'
import * as THREE from 'three'
import { LAKE_SHORELINE } from './worldConfig'

/**
 * A single flat mesh built directly from LAKE_SHORELINE (worldConfig.js) via
 * THREE.Shape + ShapeGeometry (earcut triangulation) — one draw call, same
 * cost as the old circleGeometry regardless of the shoreline's complexity.
 *
 * ShapeGeometry is built in the local XY plane; rather than rotating the
 * mesh (whose sign convention is easy to get backwards for an asymmetric
 * shape — a circle can't reveal a mirroring bug, this shoreline definitely
 * would), the Y/Z swap is done explicitly on the vertices so shoreline point
 * [x, z] always lands at world (x, 0, z), matching every other system that
 * reads LAKE_SHORELINE.
 */
const Lake = () => {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(LAKE_SHORELINE[0][0], LAKE_SHORELINE[0][1])
    for (let i = 1; i < LAKE_SHORELINE.length; i++) {
      shape.lineTo(LAKE_SHORELINE[i][0], LAKE_SHORELINE[i][1])
    }
    shape.closePath()

    const geo = new THREE.ShapeGeometry(shape)
    const position = geo.attributes.position
    for (let i = 0; i < position.count; i++) {
      const localY = position.getY(i)
      position.setZ(i, localY)
      position.setY(i, 0.02)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh geometry={geometry} receiveShadow>
      {/* Swapping Y/Z on the vertices above is a reflection (determinant -1),
          which flips triangle winding and therefore the sign of the normals
          ShapeGeometry/computeVertexNormals produce — the resulting normal
          faces down into the ground rather than up. DoubleSide sidesteps
          that instead of hand-correcting winding order (which would silently
          break again if LAKE_SHORELINE's point order ever changes); Three.js
          flips the shading normal per-fragment for back-facing triangles, so
          lighting from above still looks correct. */}
      <meshStandardMaterial
        color="#5ec8c9"
        transparent
        opacity={0.88}
        roughness={0.15}
        metalness={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default memo(Lake)
