import { DEFAULT_ENVIRONMENT } from './defaultEnvironment'
import { deriveCelestial } from './deriveCelestial'

/**
 * @typedef {import('../../types/environment.js').EnvironmentState} EnvironmentState
 * @typedef {import('./deriveCelestial.js').CelestialState} CelestialState
 */

/**
 * Everything Stars.jsx needs to render one star — nothing else. No
 * animation state, no color, no twinkle, no moon interaction: those are
 * later phases (see the roadmap in this file's derivation comment).
 *
 * @typedef {Object} Star
 * @property {number} x
 * @property {number} y
 * @property {number} radius
 * @property {number} brightness - 0-1, this star's own relative brightness
 * @property {number} opacityMultiplier - 0-1, layer-level opacity ceiling
 * @property {'background' | 'mid' | 'foreground'} layer
 */

/**
 * @typedef {Object} StarsState
 * @property {number} visibility - 0-1, the single combined multiplier
 *   (daylight × cloud cover × precipitation × fog) — apply this the same
 *   way to every star: `opacity = visibility * star.brightness * star.opacityMultiplier`
 * @property {Star[]} stars - a stable array, generated once at module load
 *   and reused for the lifetime of the page (see STAR_FIELD below) — never
 *   regenerated, never reallocated per call
 */

// ---------------------------------------------------------------------------
// Deterministic star field generation — runs exactly once, at module load.
// ---------------------------------------------------------------------------

// "Configurable" per the brief — one constant to tune, comfortably inside
// the 800-1500 target.
const STAR_COUNT = 1100

// Fixed on purpose, same reasoning as deriveSky.js's SNOW_SEED-style
// constants: every visitor, every session, sees the same star field. This
// matters for future phases (Milky Way, moon) that will want to reference
// specific star positions consistently.
const STAR_FIELD_SEED = 88172645

const SKY_WIDTH = 1440
// Stars stay within the upper "sky band," matching the same y-bound Snow.jsx
// uses (RECYCLE_Y = 480) for the same reason: this is roughly where the
// mountain silhouette begins, so stars naturally read as distant sky rather
// than needing any explicit clipping.
const SKY_BAND_HEIGHT = 480

// Layer mix: mostly tiny/faint background stars, a modest mid band, a small
// sprinkle of brighter foreground stars — "many tiny stars over a few large
// stars," per the brief.
const STAR_LAYERS = [
  { name: 'background', share: 0.7, radius: [0.5, 1.0], brightness: [0.35, 0.6], opacityMultiplier: 0.7 },
  { name: 'mid', share: 0.24, radius: [1.0, 1.6], brightness: [0.55, 0.8], opacityMultiplier: 0.85 },
  { name: 'foreground', share: 0.06, radius: [1.6, 2.3], brightness: [0.8, 1.0], opacityMultiplier: 1 },
]

// Gentle density clustering: a handful of soft "density centers" that a
// minority of stars are pulled toward, superimposed on an otherwise uniform
// field — sparse/dense variation without visible blobs or constellations.
const DENSITY_CENTER_COUNT = 5
const CLUSTERED_STAR_FRACTION = 0.3
const CLUSTER_SPREAD_PX = 140 // wide relative to the 1440x480 field, keeps it a soft gradient, not a blob

const clamp01 = (value) => Math.min(1, Math.max(0, value))
const lerp = (a, b, t) => a + (b - a) * t

// Deterministic PRNG (mulberry32) — same technique Snow.jsx uses for its
// own seeded flake layout, reimplemented here rather than imported: the two
// have no reason to share an implementation, and Snow.jsx is a completed,
// untouched system.
function createSeededRandom(seed) {
  let state = seed >>> 0
  return function next() {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomBetween(rng, min, max) {
  return lerp(min, max, rng())
}

/** Sum of 3 uniforms in [-1,1], normalized — a cheap, dependency-free
 *  approximation of a bell curve (central limit theorem). Good enough for
 *  soft positional jitter; no need for exact Box-Muller here. */
function approxGaussian(rng) {
  return (rng() + rng() + rng() - 1.5) / 1.5
}

function generateDensityCenters(rng) {
  return Array.from({ length: DENSITY_CENTER_COUNT }, () => ({
    x: rng() * SKY_WIDTH,
    y: rng() * SKY_BAND_HEIGHT,
  }))
}

function generateStarField(count, seed) {
  const rng = createSeededRandom(seed)
  const centers = generateDensityCenters(rng)
  const stars = []

  for (const layer of STAR_LAYERS) {
    const layerCount = Math.round(count * layer.share)
    for (let i = 0; i < layerCount; i++) {
      let x, y
      if (rng() < CLUSTERED_STAR_FRACTION) {
        const center = centers[Math.floor(rng() * centers.length)]
        x = center.x + approxGaussian(rng) * CLUSTER_SPREAD_PX
        y = center.y + approxGaussian(rng) * CLUSTER_SPREAD_PX
      } else {
        x = rng() * SKY_WIDTH
        y = rng() * SKY_BAND_HEIGHT
      }
      // Clamp so cluster jitter never pushes a star off the field.
      x = Math.min(SKY_WIDTH, Math.max(0, x))
      y = Math.min(SKY_BAND_HEIGHT, Math.max(0, y))

      stars.push({
        x,
        y,
        radius: randomBetween(rng, layer.radius[0], layer.radius[1]),
        brightness: randomBetween(rng, layer.brightness[0], layer.brightness[1]),
        opacityMultiplier: layer.opacityMultiplier,
        layer: layer.name,
      })
    }
  }

  return stars
}

// Generated exactly once, when this module first loads — every deriveStars()
// call returns this same array reference. This is the "generate once, store
// positions, reuse forever" requirement satisfied at the strongest possible
// level: not memoized per-component-instance, module-global.
const STAR_FIELD = generateStarField(STAR_COUNT, STAR_FIELD_SEED)

// ---------------------------------------------------------------------------
// Visibility — the only part of StarsState that changes over time.
// ---------------------------------------------------------------------------

// Anchor points mapping sunElevation -> base visibility, interpolated the
// same bracket+lerp way deriveSky.js's SKY_KEYFRAMES are. Driven by
// `sunElevation`, not `daylightAmount` — see this repo's PR notes for why:
// daylightAmount (a narrow smoothstep around the horizon) is already fully
// saturated at 0 throughout blue hour/early night, leaving no resolution
// left to reproduce a gradual multi-stage fade through exactly that range.
// sunElevation is the same underlying celestial signal but never saturates,
// which is what makes a single smooth curve across the whole night possible.
// Values tuned to roughly match the brief's example progression (dawn/dusk
// share this curve by symmetry — no separate morning-side table needed).
const VISIBILITY_KEYFRAMES = [
  { sunElevation: 1, visibility: 0 }, // solar noon
  { sunElevation: 0.15, visibility: 0 }, // still daylight
  { sunElevation: -0.15, visibility: 0 }, // sunset crossing, still too bright
  { sunElevation: -0.35, visibility: 0.02 }, // early dusk
  { sunElevation: -0.57, visibility: 0.05 }, // blue hour
  { sunElevation: -0.71, visibility: 0.25 }, // late blue hour
  { sunElevation: -0.87, visibility: 0.6 }, // early night
  { sunElevation: -0.97, visibility: 0.9 }, // approaching full dark
  { sunElevation: -1, visibility: 1 }, // true midnight, darkest
]

function findVisibilityBracket(sunElevation) {
  for (let i = 0; i < VISIBILITY_KEYFRAMES.length - 1; i++) {
    if (sunElevation <= VISIBILITY_KEYFRAMES[i].sunElevation && sunElevation >= VISIBILITY_KEYFRAMES[i + 1].sunElevation) {
      return [VISIBILITY_KEYFRAMES[i], VISIBILITY_KEYFRAMES[i + 1]]
    }
  }
  return [VISIBILITY_KEYFRAMES[VISIBILITY_KEYFRAMES.length - 2], VISIBILITY_KEYFRAMES[VISIBILITY_KEYFRAMES.length - 1]]
}

/** 0-1, how much daylight is suppressing star visibility right now — the
 *  primary driver, per the brief. Smooth, no hard thresholds. */
function daylightVisibilityFactor(sunElevation) {
  const [a, b] = findVisibilityBracket(sunElevation)
  const span = b.sunElevation - a.sunElevation
  const t = span === 0 ? 0 : clamp01((sunElevation - a.sunElevation) / span)
  return clamp01(lerp(a.visibility, b.visibility, t))
}

// cloudDensity (0-100) -> visibility multiplier. Anchors match the brief's
// examples exactly (clear 100%, few clouds 90%, broken 70%, mostly cloudy
// 40%, overcast 20%).
const CLOUD_VISIBILITY_KEYFRAMES = [
  { cloudDensity: 0, factor: 1 },
  { cloudDensity: 20, factor: 0.9 },
  { cloudDensity: 50, factor: 0.7 },
  { cloudDensity: 75, factor: 0.4 },
  { cloudDensity: 100, factor: 0.2 },
]

function cloudVisibilityFactor(cloudDensity) {
  const density = clamp01((cloudDensity ?? 0) / 100) * 100
  for (let i = 0; i < CLOUD_VISIBILITY_KEYFRAMES.length - 1; i++) {
    const a = CLOUD_VISIBILITY_KEYFRAMES[i]
    const b = CLOUD_VISIBILITY_KEYFRAMES[i + 1]
    if (density >= a.cloudDensity && density <= b.cloudDensity) {
      const t = (density - a.cloudDensity) / (b.cloudDensity - a.cloudDensity)
      return clamp01(lerp(a.factor, b.factor, t))
    }
  }
  return 0.2
}

/** Rain/snow both reduce visibility toward "almost invisible" as intensity
 *  rises — "very faint" at light intensity per the brief, rather than an
 *  abrupt cutoff. Snow is slightly less severe than heavy rain (real snowy
 *  night skies can still show a faint glow through light snowfall). */
function precipitationVisibilityFactor(precipitation) {
  if (!precipitation || precipitation.type === 'none') return 1
  const intensity = clamp01(precipitation.intensity ?? 0)
  if (precipitation.type === 'rain') return lerp(0.15, 0.03, intensity)
  if (precipitation.type === 'snow') return lerp(0.2, 0.05, intensity)
  return 1
}

/** EnvironmentState has no graduated fog-intensity field today (unlike rain/
 *  snow) — just the 'fog' weatherType classification — so this is a fixed
 *  strong reduction rather than an interpolated one. Documented as a known
 *  simplification, revisit if/when fog gets its own intensity data. */
function fogVisibilityFactor(weatherType) {
  return weatherType === 'fog' ? 0.05 : 1
}

/**
 * The Environment Engine's star layer: turns EnvironmentState + CelestialState
 * into the one StarsState the Hero scene renders. This is the only place
 * star visibility is decided — the renderer applies StarsState, it never
 * reads weather/celestial data or computes visibility itself.
 *
 * Star *positions* are not computed here per call — they're the module-level
 * STAR_FIELD, generated once (see above) and returned by reference every
 * time. Only `visibility` — daylight × cloud cover × precipitation × fog,
 * combined multiplicatively since each is an independent attenuation of the
 * same thing — is freshly computed per call.
 *
 * @param {EnvironmentState} [environment]
 * @param {CelestialState} [celestial] - defaults to deriveCelestial() at the
 *   current instant; pass an explicit one to share a single computed
 *   CelestialState across multiple derive calls (see Hero.jsx) or for tests
 * @returns {StarsState}
 */
export function deriveStars(environment = DEFAULT_ENVIRONMENT, celestial = deriveCelestial()) {
  const visibility = clamp01(
    daylightVisibilityFactor(celestial.sunElevation) *
      cloudVisibilityFactor(environment.cloudDensity) *
      precipitationVisibilityFactor(environment.precipitation) *
      fogVisibilityFactor(environment.weatherType)
  )

  return { visibility, stars: STAR_FIELD }
}
