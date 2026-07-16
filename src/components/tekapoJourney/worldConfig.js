// Single source of truth for the world's layout — every component (terrain,
// lake, roads, buildings, trees, movement bounds) reads from here so nothing
// hardcodes a position/size that has to stay in sync with another file by hand.

// World spans -WORLD_HALF_SIZE to +WORLD_HALF_SIZE on both axes.
export const WORLD_HALF_SIZE = 60
// Kept a little inside the visual terrain edge so the player never walks off it.
export const PLAYABLE_BOUNDS = 56

// PLAYER_SPEED is derived, not guessed: crossing the full 120-unit world at
// this speed takes 120 / 2 = 60s, matching "walking from one side to the
// other takes around one minute."
export const PLAYER_SPEED = 2

export const PLAYER_START = [0, 0, 14]

// The real Lake Tekapo is dramatically elongated (~24km long, ~6km wide —
// roughly 4:1) running away from the town at one end, narrower near the
// town/outlet and widening toward the far end where the Godley/Macaulay
// rivers feed in. This polygon reproduces that relationship at world scale
// (~45 units long, tapering from ~14 wide near town to ~29 wide further out,
// plus one bay indentation on the east shore) rather than GIS-accurate
// coordinates — recognizability, not survey precision, per the brief. Points
// are absolute world (x, z), an implicitly closed loop (last point connects
// back to the first), and this is the ONLY place the shoreline shape is
// defined — every exclusion/collision/terrain system below reads from it, so
// reshaping the lake later (e.g. from a real GPS trace) means editing this
// one array, not hunting through multiple files.
export const LAKE_SHORELINE = [
  [-7, -14],
  [-10, -19],
  [-12, -25],
  [-13, -31],
  [-13, -37],
  [-12, -43],
  [-13, -49],
  [-11, -54],
  [-6, -58],
  [0, -59],
  [6, -58],
  [12, -54],
  [14, -49],
  [15, -41],
  [13, -35],
  [16, -29], // bay indentation on the east shore
  [13, -25],
  [10, -19],
  [7, -14],
]

// How far beyond the shoreline the terrain takes to ramp back up to full
// relief (see Terrain.jsx) — keeps the ground flat right up to the water's
// edge everywhere along the shore, not just near the world origin.
export const LAKE_SHORE_FLATTEN_MARGIN = 10

// Straight strips, each defined by a centerline segment + half-width.
export const ROADS = [
  { from: [-56, 0], to: [56, 0], halfWidth: 3 }, // the town's main east-west street
  { from: [0, -14], to: [0, 10], halfWidth: 3 }, // connects down toward the lake shore
]

export const BUILDINGS = [
  { position: [-12, 0, 7], size: [7, 4, 6], roofColor: '#b5654a', label: 'Visitor Centre' },
  { position: [12, 0, 7], size: [5, 3.2, 4], roofColor: '#7c9070' },
  { position: [-12, 0, -7], size: [4.5, 3, 4], roofColor: '#2d6e92' },
  { position: [12, 0, -7], size: [5, 3.4, 4.5], roofColor: '#c8a85a' },
]

// Terrain shape — modeled on the real Mackenzie Basin (a huge, ancient glacial
// outwash plain: flat-to-gently-undulating tussock grassland, ringed by
// foothills that rise toward the Southern Alps/Two Thumb Range). Three
// blended layers, each its own radial zone, so the town stays flat and the
// terrain reads as "broad open basin" near the middle and "rolling foothill
// country" only near the outer edge, rather than one uniform bumpy field:
//
//   0 ------ FLAT_ZONE_RADIUS ------ (+FALLOFF) ------ FOOTHILL_START ------ FOOTHILL_FULL ------ WORLD_HALF_SIZE
//   |  flat town/lake/roads  |   gentle basin swell blends in   |   basin only   |  foothills blend in  |  full rolling hills  |
//
// All values here are intentionally named/grouped for easy replacement with
// real measurements later (e.g. an actual slope reading from a Tekapo hillside
// photo) rather than hardcoded inline in Terrain.jsx.
export const FLAT_ZONE_RADIUS = 22
export const FLAT_ZONE_FALLOFF = 14

// Layer 1 — basin swell: real Mackenzie Basin terrain is described as
// highest at its northern end, gradually descending south — a genuine
// large-scale directional tilt, not a symmetric swell. (An earlier version
// of this layer used sin(x)*cos(z), which produces an unmistakable 4-fold
// diamond/saddle symmetry — a classic "obviously mathematical" artifact,
// confirmed by rendering an actual top-down heightmap of the field. The
// tilt fixes that by construction: a linear gradient has no repeating
// pattern at all.) `noiseAmplitude` adds just a touch of broad irregularity
// on top so the tilt alone doesn't look like a perfectly flat ramp.
export const TERRAIN_BASIN = {
  tiltAmplitude: 0.35,
  noiseAmplitude: 0.22,
  noiseFrequency: 0.02,
  noiseAngle: 0.5, // radians — rotates the noise sampling off-axis from the tilt direction
}

// Layer 2 — rolling foothills: blended in only beyond the basin plain. Each
// octave samples along its own ROTATED axis (a different angle per octave) —
// without this, a sum of axis-aligned sin(x)*sin(z) octaves still carries the
// same diamond symmetry no matter how many octaves you stack, since they all
// share the same x/z alignment. Rotating each octave independently is the
// standard fix: each one keeps its own local symmetry, but summed at
// different angles the *combined* result has none. "Long smooth slopes,
// minimal steep cliffs" still comes from every term here being a continuous
// trig function with modest amplitude — no discontinuity anywhere in the
// height field, so cliffs are impossible by construction.
export const TERRAIN_FOOTHILL = {
  amplitude: 1.0,
  startRadius: 38,
  fullRadius: 58,
  octaves: [
    { frequency: 0.045, weight: 1, angle: 0.3 },
    { frequency: 0.09, weight: 0.5, angle: 1.4 },
    { frequency: 0.17, weight: 0.28, angle: 2.6 },
    { frequency: 0.33, weight: 0.14, angle: 0.9 },
  ],
}

// Layer 3 — rocky roughness: small, higher-frequency jitter masked to patches
// (not everywhere) so only some hillside areas read as rockier/rougher than
// the smooth grass hills around them — geometry only in this phase; a visual
// rock material comes later with the full color-palette pass. Rotated the
// same way as the foothill octaves, for the same reason.
export const TERRAIN_ROCKY = {
  amplitude: 0.16,
  frequency: 0.5,
  angle: 0.6,
  patchFrequency: 0.04,
  patchAngle: 1.1,
  patchThreshold: 0.3, // higher = rockier patches are rarer/smaller
}

const EXCLUSION_MARGIN = 2.5

function distanceToSegment(px, pz, [ax, az], [bx, bz]) {
  const abx = bx - ax
  const abz = bz - az
  const lengthSq = abx * abx + abz * abz
  const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / lengthSq))
  const closestX = ax + abx * t
  const closestZ = az + abz * t
  return Math.hypot(px - closestX, pz - closestZ)
}

/** Standard ray-casting point-in-polygon test, treating `polygon` as an
 *  implicitly closed loop. */
function pointInPolygon(x, z, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, zi] = polygon[i]
    const [xj, zj] = polygon[j]
    const crossesRay = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi
    if (crossesRay) inside = !inside
  }
  return inside
}

/** Shortest distance from (x, z) to any edge of `polygon` (closed loop) —
 *  reuses distanceToSegment so the same segment-distance math backs both
 *  road exclusion and shoreline exclusion instead of two implementations. */
function distanceToPolygon(x, z, polygon) {
  let minDistance = Infinity
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    minDistance = Math.min(minDistance, distanceToSegment(x, z, polygon[j], polygon[i]))
  }
  return minDistance
}

/** 0 inside/on the shoreline, otherwise the distance out to it — used by
 *  Terrain.jsx to flatten the ground near the water, and available for
 *  future landmark placement ("put this building N units from the shore"). */
export function distanceToLakeShore(x, z) {
  return pointInPolygon(x, z, LAKE_SHORELINE) ? 0 : distanceToPolygon(x, z, LAKE_SHORELINE)
}

export function isInsideLake(x, z, margin = EXCLUSION_MARGIN) {
  if (pointInPolygon(x, z, LAKE_SHORELINE)) return true
  return distanceToPolygon(x, z, LAKE_SHORELINE) < margin
}

export function isOnRoad(x, z, margin = EXCLUSION_MARGIN) {
  return ROADS.some((road) => distanceToSegment(x, z, road.from, road.to) < road.halfWidth + margin)
}

export function isInsideBuilding(x, z, margin = EXCLUSION_MARGIN) {
  return BUILDINGS.some(({ position, size }) => {
    const [bx, , bz] = position
    const [w, , d] = size
    return Math.abs(x - bx) < w / 2 + margin && Math.abs(z - bz) < d / 2 + margin
  })
}

export function isBlocked(x, z) {
  return isInsideLake(x, z) || isOnRoad(x, z) || isInsideBuilding(x, z)
}
