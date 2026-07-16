import { memo, useMemo } from 'react'
import * as THREE from 'three'
import {
  WORLD_HALF_SIZE,
  FLAT_ZONE_RADIUS,
  FLAT_ZONE_FALLOFF,
  TERRAIN_BASIN,
  TERRAIN_FOOTHILL,
  TERRAIN_ROCKY,
  LAKE_SHORE_FLATTEN_MARGIN,
  distanceToLakeShore,
} from './worldConfig'

const SEGMENTS = 96

/** Rotates a sampling point before it hits a sine wave — sampling the same
 *  sin(x)*sin(z) at different angles per octave is what keeps a sum of cheap
 *  sinusoids from reading as one obviously-symmetric mathematical pattern
 *  (see the angle comments in worldConfig.js). */
const rotate = (x, z, angle) => {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return [x * cos - z * sin, x * sin + z * cos]
}

/** Sum of a few rotated, offset sine waves — a cheap, dependency-free
 *  stand-in for real Perlin/Simplex noise, good enough at this scale. */
const fbm = (x, z, octaves) => {
  let sum = 0
  for (const { frequency, weight, angle } of octaves) {
    const [rx, rz] = rotate(x, z, angle)
    sum += Math.sin(rx * frequency) * Math.sin(rz * frequency * 1.3 + 2.1) * weight
  }
  return sum
}

/**
 * Three blended layers modeling the real Mackenzie Basin's shape (see the
 * zone diagram in worldConfig.js): a flat town/lake/road zone, a broad basin
 * floor that mostly just tilts gently from "north" to "south" (matching the
 * real basin's described high-to-low gradient) rather than swelling
 * symmetrically, and rolling foothills that only appear toward the outer
 * edge, blending into the distant Mountains ring. Every layer is a
 * continuous function — there is no discontinuity anywhere in the height
 * field, so steep cliffs are structurally impossible, not just tuned to
 * look gentle.
 */
export const heightAt = (x, z) => {
  const distanceFromCenter = Math.hypot(x, z)

  const basinFalloff = THREE.MathUtils.smoothstep(distanceFromCenter, FLAT_ZONE_RADIUS, FLAT_ZONE_RADIUS + FLAT_ZONE_FALLOFF)
  const tilt = (z / WORLD_HALF_SIZE) * TERRAIN_BASIN.tiltAmplitude
  const [nx, nz] = rotate(x, z, TERRAIN_BASIN.noiseAngle)
  const basinNoise = Math.sin(nx * TERRAIN_BASIN.noiseFrequency) * Math.sin(nz * TERRAIN_BASIN.noiseFrequency * 1.2 + 1) * TERRAIN_BASIN.noiseAmplitude
  const basin = (tilt + basinNoise) * basinFalloff

  const foothillFalloff = THREE.MathUtils.smoothstep(distanceFromCenter, TERRAIN_FOOTHILL.startRadius, TERRAIN_FOOTHILL.fullRadius)
  const foothill = fbm(x, z, TERRAIN_FOOTHILL.octaves) * TERRAIN_FOOTHILL.amplitude * foothillFalloff

  // Patchy, not everywhere — only where a low-frequency mask exceeds the
  // threshold does the higher-frequency rocky jitter contribute, and only in
  // the foothill zone (the basin floor itself stays smooth grassland).
  const [pmx, pmz] = rotate(x, z, TERRAIN_ROCKY.patchAngle)
  const rockyMask = Math.max(0, Math.sin(pmx * TERRAIN_ROCKY.patchFrequency) * Math.sin(pmz * TERRAIN_ROCKY.patchFrequency * 1.3) - TERRAIN_ROCKY.patchThreshold)
  const [rx, rz] = rotate(x, z, TERRAIN_ROCKY.angle)
  const rocky = Math.sin(rx * TERRAIN_ROCKY.frequency) * Math.sin(rz * TERRAIN_ROCKY.frequency * 1.3) * TERRAIN_ROCKY.amplitude * rockyMask * foothillFalloff

  // The Phase 2 shoreline is far more elongated than the old circular lake —
  // it reaches well past the radial flat zone above, out into what would
  // otherwise be foothill territory. Flatten the ground near the shore
  // regardless of how far that is from the world origin, so the water never
  // clips through rolling terrain at the far end of the lake.
  const shoreFalloff = THREE.MathUtils.smoothstep(distanceToLakeShore(x, z), 0, LAKE_SHORE_FLATTEN_MARGIN)

  return (basin + foothill + rocky) * shoreFalloff
}

const Terrain = () => {
  const geometry = useMemo(() => {
    const size = WORLD_HALF_SIZE * 2
    const geo = new THREE.PlaneGeometry(size, size, SEGMENTS, SEGMENTS)
    geo.rotateX(-Math.PI / 2)

    const position = geo.attributes.position
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i)
      const z = position.getZ(i)
      position.setY(i, heightAt(x, z))
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#9bc98a" roughness={1} />
    </mesh>
  )
}

export default memo(Terrain)
