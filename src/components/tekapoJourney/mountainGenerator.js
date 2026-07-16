import * as THREE from 'three'
import { LAYER_BASE_RADIUS, RIDGE_BASE_DEPTH } from './mountainData'

function hexToRgb01(hex) {
  const c = new THREE.Color(hex)
  return [c.r, c.g, c.b]
}

// 0deg = north (-Z, toward the lake's far end), clockwise — see mountainData.js.
function angleToXZ(angleDeg, radius) {
  const rad = (angleDeg * Math.PI) / 180
  return [Math.sin(rad) * radius, -Math.cos(rad) * radius]
}

/**
 * Builds one merged, vertex-colored BufferGeometry for every range sharing
 * `layer` — a single draw call regardless of how many named ranges (each
 * with its own color) make up that layer's ridgeline. Entirely static,
 * built once from authored data in mountainData.js: no per-frame work, no
 * runtime randomness. Each ridge segment (the straight run between two
 * consecutive {angle, height} points) becomes a flat quad running from a
 * radially-inset base up to the authored peak height, with an optional
 * second "snow cap" quad layered on top in a lighter color for ranges
 * configured with `snowCap`.
 */
export function buildLayerGeometry(ranges, layer) {
  const baseRadius = LAYER_BASE_RADIUS[layer]
  const positions = []
  const colors = []

  const pushTriangle = (a, b, c, color) => {
    positions.push(...a, ...b, ...c)
    colors.push(...color, ...color, ...color)
  }

  const pushQuad = (base1, base2, top2, top1, color) => {
    pushTriangle(base1, base2, top2, color)
    pushTriangle(base1, top2, top1, color)
  }

  for (const range of ranges) {
    const rockColor = hexToRgb01(range.baseColor)
    const snowColor = range.snowCap ? hexToRgb01(range.snowCap.color) : null
    const minSnowHeight = range.snowCap?.minHeight ?? Infinity

    for (let i = 0; i < range.ridge.length - 1; i++) {
      const p1 = range.ridge[i]
      const p2 = range.ridge[i + 1]

      const [bx1, bz1] = angleToXZ(p1.angle, baseRadius)
      const [bx2, bz2] = angleToXZ(p2.angle, baseRadius)
      const [px1, pz1] = angleToXZ(p1.angle, range.distance)
      const [px2, pz2] = angleToXZ(p2.angle, range.distance)

      const base1 = [bx1, RIDGE_BASE_DEPTH, bz1]
      const base2 = [bx2, RIDGE_BASE_DEPTH, bz2]

      // Per-vertex split between "rock" (below minSnowHeight) and "snow"
      // (above it), clamped per vertex — a segment with only one end above
      // the snow line tapers the cap to a point instead of producing
      // inverted/negative-thickness geometry at the other end.
      const split1 = Math.min(p1.height, minSnowHeight)
      const split2 = Math.min(p2.height, minSnowHeight)
      const splitTop1 = [px1, split1, pz1]
      const splitTop2 = [px2, split2, pz2]

      pushQuad(base1, base2, splitTop2, splitTop1, rockColor)

      if (snowColor && (p1.height > minSnowHeight || p2.height > minSnowHeight)) {
        const peak1 = [px1, p1.height, pz1]
        const peak2 = [px2, p2.height, pz2]
        pushQuad(splitTop1, splitTop2, peak2, peak1, snowColor)
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}
