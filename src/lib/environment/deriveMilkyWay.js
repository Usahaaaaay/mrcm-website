import { DEFAULT_ENVIRONMENT } from './defaultEnvironment'
import { deriveCelestial } from './deriveCelestial'

/**
 * @typedef {import('../../types/environment.js').EnvironmentState} EnvironmentState
 * @typedef {import('./deriveCelestial.js').CelestialState} CelestialState
 */

/**
 * A single soft glow shape along the band's spine. Everything MilkyWay.jsx
 * needs to render one blob — no animation state, no per-frame anything.
 *
 * @typedef {Object} MilkyWayBlob
 * @property {number} x
 * @property {number} y
 * @property {number} rx
 * @property {number} ry
 * @property {number} relativeBrightness - 0-1, this blob's own contribution
 *   to the "brighter and darker regions" variation along the band
 * @property {number} paletteIndex - which of MILKY_WAY_PALETTE's colors this
 *   blob uses (see LakeIllustration.jsx, which defines one radial gradient
 *   per palette entry — same "soft radial glow" technique the moon glow and
 *   cloud puffs already use)
 * @property {number} blurPx
 */

/** Cool white / pale grey / faint cyan / muted lavender — exported so
 *  LakeIllustration.jsx can define one matching radial gradient per entry,
 *  keeping the actual color values defined in exactly one place. */
export const MILKY_WAY_PALETTE = ['#F3F6F8', '#DCE4EA', '#C9DDE0', '#CBC3D9']

/**
 * @typedef {Object} MilkyWayState
 * @property {boolean} visible - whether to render at all; computed here (not
 *   in the component) per the brief's "no rendering component should
 *   calculate ... visibility" requirement
 * @property {number} opacity - 0-1, overall alpha ceiling for the whole band
 * @property {number} brightness - 0-1, a second baseline intensity dial
 *   (fixed, not weather/time-reactive — see BASE_BRIGHTNESS below); kept
 *   distinct from `opacity` only to match the brief's suggested shape, both
 *   ultimately feed the same final multiplication
 * @property {number} skyDarkness - 0-1, the day/night factor (renamed from
 *   the brief's earlier "nightFactor" per its own later Future-Proofing
 *   Requirement)
 * @property {number} cloudFade - 0-1
 * @property {number} weatherFade - 0-1 (precipitation + fog combined, per
 *   the brief's "Night × Cloud Fade × Weather Fade" concept)
 * @property {number} moonlightFade - 0-1, how much moonlight is currently
 *   washing this out — sourced from deriveMoon.js's MoonState.moonlightFade
 *   (see this function's `moonlightFade` parameter), not computed here.
 *   Defaults to 1 (no suppression) so this stays backward compatible with
 *   any caller that doesn't have a MoonState to pass yet.
 * @property {number} rotation - degrees, fixed — the band's orientation
 *   never changes (see Motion: static, no animation)
 * @property {number} bandWidth - 0-1, fixed — how wide the band's
 *   perpendicular spread is
 * @property {MilkyWayBlob[]} blobs - a stable array, generated once at
 *   module load and reused for the lifetime of the page, same pattern as
 *   deriveStars.js's STAR_FIELD
 */

// ---------------------------------------------------------------------------
// Deterministic blob layout — generated exactly once, at module load. Same
// "generate once, store positions, reuse forever" pattern deriveStars.js
// established; not shared code (this file has its own seeded PRNG — see
// deriveStars.js's own doc comment for why these aren't consolidated).
// ---------------------------------------------------------------------------

const BLOB_SEED = 24601917
const BLOB_COUNT = 18

// A diagonal spine spanning most of the sky, reaching lower than the star
// field's own SKY_BAND_HEIGHT (480, in deriveStars.js) on purpose — a real
// Milky Way band stretches toward the horizon, and the front mountain range
// (painted after both stars and this layer) naturally occludes its lower
// reach, the same "distant sky, no explicit clipping needed" reasoning
// Snow.jsx and deriveStars.js both already rely on.
const SPINE_START = { x: 60, y: 40 }
const SPINE_END = { x: 1360, y: 560 }

// Fixed "artistic" values — the band's shape never reacts to weather/time,
// only its opacity does (see Motion: the Milky Way remains static).
const ROTATION_DEG = -18
const BAND_WIDTH = 0.42
const BASE_OPACITY = 0.32
const BASE_BRIGHTNESS = 0.55

const clamp01 = (value) => Math.min(1, Math.max(0, value))
const lerp = (a, b, t) => a + (b - a) * t

// Deterministic PRNG (mulberry32) — a fresh, self-contained copy, same
// technique as deriveStars.js/Snow.jsx, deliberately not imported from
// either (both are completed systems this phase must not touch).
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

/** Sum of 3 uniforms in [-1,1], normalized — see deriveStars.js's identical
 *  helper; a cheap, dependency-free stand-in for real noise, which the brief
 *  explicitly asks to avoid ("avoid expensive noise calculations"). */
function approxGaussian(rng) {
  return (rng() + rng() + rng() - 1.5) / 1.5
}

/** Places BLOB_COUNT soft glows along SPINE_START→SPINE_END, each nudged
 *  off an evenly-spaced position (not perfectly uniform — "avoid obvious
 *  repeating patterns") and off the spine line itself (perpendicular
 *  jitter, scaled by BAND_WIDTH). Large, heavily-blurred, heavily
 *  overlapping ellipses are what let ~18 discrete shapes read as one
 *  continuous organic band once rendered — no real noise field needed. */
function generateBlobs(seed) {
  const rng = createSeededRandom(seed)
  const blobs = []

  for (let i = 0; i < BLOB_COUNT; i++) {
    const t = clamp01((i + 0.5) / BLOB_COUNT + (rng() - 0.5) * 0.08)
    const spineX = lerp(SPINE_START.x, SPINE_END.x, t)
    const spineY = lerp(SPINE_START.y, SPINE_END.y, t)
    const perpJitter = approxGaussian(rng) * 90 * BAND_WIDTH

    blobs.push({
      x: spineX,
      y: spineY + perpJitter,
      rx: randomBetween(rng, 110, 220),
      ry: randomBetween(rng, 50, 100),
      relativeBrightness: randomBetween(rng, 0.4, 1),
      paletteIndex: Math.floor(rng() * MILKY_WAY_PALETTE.length),
      blurPx: randomBetween(rng, 30, 55),
    })
  }

  return blobs
}

const MILKY_WAY_BLOBS = generateBlobs(BLOB_SEED)

// ---------------------------------------------------------------------------
// Visibility factors — the only parts of MilkyWayState that change per call.
// ---------------------------------------------------------------------------

// sunElevation -> skyDarkness. Same bracket+lerp technique as deriveSky.js/
// deriveStars.js's own keyframe tables, independently tuned here: the Milky
// Way physically needs darker skies than ordinary bright stars before it
// becomes visible at all, so this ramps up later (more negative
// sunElevation) than deriveStars.js's own curve — a deliberate difference,
// not an oversight.
const SKY_DARKNESS_KEYFRAMES = [
  { sunElevation: 1, skyDarkness: 0 }, // solar noon
  { sunElevation: 0.1, skyDarkness: 0 }, // still day
  { sunElevation: -0.2, skyDarkness: 0 }, // just after sunset, still too bright
  { sunElevation: -0.45, skyDarkness: 0.05 }, // dusk deepening
  { sunElevation: -0.65, skyDarkness: 0.2 }, // blue hour
  { sunElevation: -0.8, skyDarkness: 0.55 }, // early night
  { sunElevation: -0.92, skyDarkness: 0.85 }, // approaching full dark
  { sunElevation: -1, skyDarkness: 1 }, // true midnight
]

// Order-agnostic on purpose: SKY_DARKNESS_KEYFRAMES is sorted descending
// (sunElevation 1 -> -1) while CLOUD_FADE_KEYFRAMES is sorted ascending
// (cloudDensity 0 -> 100) — comparing against min/max of each consecutive
// pair (rather than assuming which one is larger) lets both tables share
// this one bracket-finder correctly instead of needing two near-identical
// copies with opposite comparison directions.
function findBracket(keyframes, key, value) {
  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i][key]
    const b = keyframes[i + 1][key]
    if (value >= Math.min(a, b) && value <= Math.max(a, b)) {
      return [keyframes[i], keyframes[i + 1]]
    }
  }
  return [keyframes[keyframes.length - 2], keyframes[keyframes.length - 1]]
}

/** 0-1, "Night" per the brief's Visibility concept — smooth, no hard
 *  thresholds; dawn fade-out and dusk fade-in share this curve by symmetry
 *  (sunElevation crosses the same values on both sides of midnight). */
function skyDarknessFactor(sunElevation) {
  const [a, b] = findBracket(SKY_DARKNESS_KEYFRAMES, 'sunElevation', sunElevation)
  const span = b.sunElevation - a.sunElevation
  const t = span === 0 ? 0 : clamp01((sunElevation - a.sunElevation) / span)
  return clamp01(lerp(a.skyDarkness, b.skyDarkness, t))
}

// cloudDensity (0-100) -> fade factor. Anchors match this phase's own
// examples exactly (clear 100%, mostly clear 90%, partly cloudy 65%, cloudy
// 35%, overcast 10%) — deliberately not reusing deriveStars.js's cloud
// curve, which uses different percentages for the same cloud levels: the
// Milky Way is a far fainter, more diffuse phenomenon than individual bright
// stars and is realistically washed out more easily by the same cloud cover.
const CLOUD_FADE_KEYFRAMES = [
  { cloudDensity: 0, factor: 1 },
  { cloudDensity: 15, factor: 0.9 },
  { cloudDensity: 40, factor: 0.65 },
  { cloudDensity: 70, factor: 0.35 },
  { cloudDensity: 100, factor: 0.1 },
]

function cloudFadeFactor(cloudDensity) {
  const density = clamp01((cloudDensity ?? 0) / 100) * 100
  const [a, b] = findBracket(CLOUD_FADE_KEYFRAMES, 'cloudDensity', density)
  const span = b.cloudDensity - a.cloudDensity
  const t = span === 0 ? 0 : clamp01((density - a.cloudDensity) / span)
  return clamp01(lerp(a.factor, b.factor, t))
}

/** Precipitation + fog combined into the brief's single "Weather Fade"
 *  factor (unlike deriveStars.js, which keeps precipitation and fog as two
 *  separate multipliers — this phase's spec explicitly bundles them into
 *  one). Rain/snow/fog each specify one target percentage rather than a
 *  light/heavy range, so intensity produces a smaller, still-smooth
 *  variation within each weather type rather than a dramatic swing. */
function weatherFadeFactor(environment) {
  const { weatherType, precipitation } = environment
  if (weatherType === 'fog') return 0.02 // within the brief's stated 0-5% band
  if (precipitation?.type === 'rain') return lerp(0.3, 0.05, clamp01(precipitation.intensity ?? 0))
  if (precipitation?.type === 'snow') return lerp(0.35, 0.1, clamp01(precipitation.intensity ?? 0))
  return 1
}

// Below this, the composed factors round to an imperceptible band — treat
// as not visible at all rather than rendering ~18 essentially-invisible blobs.
const VISIBLE_THRESHOLD = 0.01

/**
 * The Environment Engine's Milky Way layer: turns EnvironmentState +
 * CelestialState into the one MilkyWayState the Hero scene renders. This is
 * the only place Milky Way visibility is decided — no time, weather, cloud,
 * or visibility calculation happens in MilkyWay.jsx.
 *
 * Blob *positions* are not computed here per call — they're the
 * module-level MILKY_WAY_BLOBS, generated once (see above) and returned by
 * reference every time, same as deriveStars.js's STAR_FIELD. Only the
 * scalar factors (skyDarkness, cloudFade, weatherFade) are freshly computed
 * per call; `opacity`, `brightness`, `rotation`, and `bandWidth` are fixed.
 *
 * The renderer (MilkyWay.jsx), not this function, performs the final
 * multiplication — see this repo's PR notes: that's what lets a future
 * phase (atmospheric scattering, aurora) add one more multiplier to that
 * line without this function or its shape needing to change. `moonlightFade`
 * (added alongside deriveMoon.js) is the first example of this pattern in
 * practice: this function doesn't compute moon influence itself — that
 * would mean importing deriveMoon.js and breaking the "every derive
 * function reads only environment/celestial" independence every other
 * derive function in this engine has — it's threaded through as a plain
 * parameter, computed by Hero.jsx from deriveMoon()'s own output and passed
 * in here, the same way `celestial` itself already gets computed once and
 * shared across derive calls.
 *
 * @param {EnvironmentState} [environment]
 * @param {CelestialState} [celestial] - defaults to deriveCelestial() at the
 *   current instant; pass an explicit one to share a single computed
 *   CelestialState across multiple derive calls (see Hero.jsx) or for tests
 * @param {number} [moonlightFade] - 0-1, from deriveMoon()'s MoonState;
 *   defaults to 1 (no suppression) if the moon hasn't been computed yet
 * @returns {MilkyWayState}
 */
export function deriveMilkyWay(environment = DEFAULT_ENVIRONMENT, celestial = deriveCelestial(), moonlightFade = 1) {
  const skyDarkness = skyDarknessFactor(celestial.sunElevation)
  const cloudFade = cloudFadeFactor(environment.cloudDensity)
  const weatherFade = weatherFadeFactor(environment)

  const visible = skyDarkness * cloudFade * weatherFade * moonlightFade * BASE_OPACITY * BASE_BRIGHTNESS > VISIBLE_THRESHOLD

  return {
    visible,
    opacity: BASE_OPACITY,
    brightness: BASE_BRIGHTNESS,
    skyDarkness,
    cloudFade,
    weatherFade,
    moonlightFade,
    rotation: ROTATION_DEG,
    bandWidth: BAND_WIDTH,
    blobs: MILKY_WAY_BLOBS,
  }
}
