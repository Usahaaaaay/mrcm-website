import * as THREE from 'three'

const UP_AXIS = new THREE.Vector3(0, 1, 0)
const TAU = Math.PI * 2

// Module-level scratch vector reused every frame instead of allocating a new
// THREE.Vector3 per call — this runs inside useFrame, so avoiding per-frame
// allocations matters. Callers must use the returned vector immediately; it
// gets overwritten on the next call.
const scratch = new THREE.Vector3()

/**
 * Camera-relative movement direction in world space (Y stays 0 — flat ground
 * movement, no physics yet). `cameraYaw` is the same angle the camera orbits
 * the player by, so "forward" always means "away from the camera."
 *
 * `input` is the already-merged `{x, z}` vector from the input layer (see
 * src/input/) — magnitude is deliberately NOT forced to 1 here, since it may
 * be a partial value from an analog touch joystick (smooth analog movement
 * requires preserving how far the stick is pushed, not snapping to full speed).
 */
export function computeMoveVector(input, cameraYaw) {
  scratch.set(input.x, 0, input.z)
  if (scratch.lengthSq() > 0) {
    scratch.applyAxisAngle(UP_AXIS, cameraYaw)
  }
  return scratch
}

export function clampToBounds(position, bounds) {
  position.x = THREE.MathUtils.clamp(position.x, -bounds, bounds)
  position.z = THREE.MathUtils.clamp(position.z, -bounds, bounds)
}

/** Wraps a radian angle into (-PI, PI]. */
function wrapAngle(angle) {
  return angle - TAU * Math.floor((angle + Math.PI) / TAU)
}

/**
 * Frame-rate-independent exponential smoothing for an angle, taking the
 * shortest path around the circle (so facing 179deg->-179deg turns 2deg, not
 * almost a full rotation the other way).
 */
export function dampAngle(current, target, lambda, dt) {
  const angleDelta = wrapAngle(target - current)
  return current + angleDelta * (1 - Math.exp(-lambda * dt))
}
