import { DEFAULT_ENVIRONMENT } from './defaultEnvironment'
import { deriveCelestial } from './deriveCelestial'

/**
 * @typedef {import('../../types/environment.js').EnvironmentState} EnvironmentState
 * @typedef {import('./deriveCelestial.js').CelestialState} CelestialState
 */

/**
 * @typedef {'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent'} MoonPhaseName
 */

/**
 * Concrete, render-ready moon data. Same philosophy as MilkyWayState: the
 * renderer (Moon.jsx) applies this, it never computes position, phase, or
 * visibility itself.
 *
 * @typedef {Object} MoonState
 * @property {boolean} visible
 * @property {number} x - SVG viewBox coordinate, ready to render
 * @property {number} y
 * @property {number} altitude - degrees, stylized (-90..90) — see
 *   moonAltitude() below; not real topocentric altitude
 * @property {number} azimuth - degrees, stylized (0..360)
 * @property {number} phase - 0-1, 0/1 = new moon, 0.5 = full moon
 * @property {MoonPhaseName} phaseName
 * @property {number} illumination - 0-1, fraction of the disc lit
 * @property {number} opacity - 0-1, base ceiling for the disc (renderer
 *   multiplies this by the fade factors below — same pattern as MilkyWayState)
 * @property {number} size - fixed radius multiplier; reserved for a future
 *   phase (e.g. perigee/"supermoon"), always 1 today
 * @property {number} glow - 0-1, halo intensity ceiling
 * @property {number} positionFade - 0-1, "Celestial Position": is the moon
 *   above the horizon at all
 * @property {number} cloudFade - 0-1
 * @property {number} weatherFade - 0-1
 * @property {number} daylightFade - 0-1, general sky-brightness washout
 * @property {number} moonlightFade - 0-1, exposed for downstream celestial
 *   renderers (deriveMilkyWay.js today) so they stop needing to calculate
 *   their own moon influence — see this file's derivation comment
 */

const clamp01 = (value) => Math.min(1, Math.max(0, value))
const lerp = (a, b, t) => a + (b - a) * t

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

// Order-agnostic bracket search — same technique as deriveMilkyWay.js's
// findBracket (not imported from there: two independent modules, no shared
// dependency between completed systems).
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

function interpolate(keyframes, key, valueKey, x) {
  const [a, b] = findBracket(keyframes, key, x)
  const span = b[key] - a[key]
  const t = span === 0 ? 0 : clamp01((x - a[key]) / span)
  return clamp01(lerp(a[valueKey], b[valueKey], t))
}

// ---------------------------------------------------------------------------
// Phase — a simplified synodic-month approximation anchored to a real known
// new moon, not a real ephemeris (no orbital elements, no perturbations).
// Close enough to the real phase for a stylized illustration, genuinely
// physically motivated rather than arbitrary.
// ---------------------------------------------------------------------------

const SYNODIC_MONTH_DAYS = 29.530588853
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0)
const MS_PER_DAY = 86_400_000

/** 0-1, 0 (and 1) = new moon, 0.5 = full moon. */
function computePhase(date) {
  const daysSinceEpoch = (date.getTime() - KNOWN_NEW_MOON_UTC) / MS_PER_DAY
  const cycles = daysSinceEpoch / SYNODIC_MONTH_DAYS
  return cycles - Math.floor(cycles)
}

// Eight equal 0.125-wide bands, centered on each named phase (New Moon
// straddles the 0/1 wrap).
function phaseNameFor(phase) {
  if (phase < 0.0625 || phase >= 0.9375) return 'New Moon'
  if (phase < 0.1875) return 'Waxing Crescent'
  if (phase < 0.3125) return 'First Quarter'
  if (phase < 0.4375) return 'Waxing Gibbous'
  if (phase < 0.5625) return 'Full Moon'
  if (phase < 0.6875) return 'Waning Gibbous'
  if (phase < 0.8125) return 'Last Quarter'
  return 'Waning Crescent'
}

/** 0-1, fraction of the disc illuminated — the standard (1-cos)/2
 *  relationship between phase angle and lit fraction. */
function illuminationFor(phase) {
  return (1 - Math.cos(2 * Math.PI * phase)) / 2
}

// ---------------------------------------------------------------------------
// Position — reuses the sun's own elevation *shape* (see deriveCelestial.js's
// sunElevation), offset by the moon's phase. This is a real, physically-
// motivated relationship (a full moon rises near sunset and peaks near
// midnight; a new moon tracks the sun and is up during the day, not at
// night) reproduced with the same stylized sine curve deriveCelestial.js
// already uses for the sun — not a separate lunar ephemeris.
// ---------------------------------------------------------------------------

// Horizon-ish line and peak height for the moon's rendered arc — matches
// the same "sky band" region stars/Milky Way already occupy.
const ARC_X_START = 150
const ARC_X_END = 1290
const ARC_Y_HORIZON = 480
const ARC_Y_ZENITH = 100

function moonHourAngle(localHour, phase) {
  return ((((localHour - phase * 24) % 24) + 24) % 24)
}

/** -1..1, same sine shape as deriveCelestial.js's sunElevation, evaluated at
 *  the phase-shifted hour angle. */
function moonAltitudeRaw(hourAngle) {
  return Math.sin((2 * Math.PI * (hourAngle - 6)) / 24)
}

// ---------------------------------------------------------------------------
// Visibility factors.
// ---------------------------------------------------------------------------

// altitude (-1..1) -> how "up" the moon is, smoothed around the horizon
// crossing rather than a hard cutoff.
function positionFadeFactor(altitude) {
  return smoothstep(-0.05, 0.15, altitude)
}

// cloudDensity (0-100) -> fade factor. Anchors match this phase's own
// examples (clear 100%, partly cloudy 80%, cloudy 45%, overcast 15%) —
// independently tuned from deriveStars.js/deriveMilkyWay.js's own cloud
// curves, same as those two are independently tuned from each other: the
// moon is a bright, compact disc, more resilient to thin cloud than the
// diffuse Milky Way but still more easily dimmed than scattered stars.
const CLOUD_FADE_KEYFRAMES = [
  { cloudDensity: 0, factor: 1 },
  { cloudDensity: 25, factor: 0.8 },
  { cloudDensity: 55, factor: 0.45 },
  { cloudDensity: 100, factor: 0.15 },
]

/** Precipitation + fog combined into one "Weather Fade" factor, same
 *  bundling deriveMilkyWay.js uses. Targets from this phase's own brief
 *  (rain 10%, snow 15%, fog 0-5%). */
function weatherFadeFactor(environment) {
  const { weatherType, precipitation } = environment
  if (weatherType === 'fog') return 0.03
  if (precipitation?.type === 'rain') return lerp(0.35, 0.1, clamp01(precipitation.intensity ?? 0))
  if (precipitation?.type === 'snow') return lerp(0.4, 0.15, clamp01(precipitation.intensity ?? 0))
  return 1
}

// sunElevation -> daylightFade. "Day: mostly hidden" (not fully zero — the
// moon really is faintly visible in a bright daytime sky) through
// "Night: fully visible."
const DAYLIGHT_FADE_KEYFRAMES = [
  { sunElevation: 1, factor: 0.08 }, // solar noon — mostly hidden, not fully gone
  { sunElevation: 0.3, factor: 0.15 },
  { sunElevation: 0, factor: 0.4 }, // sunrise/sunset crossing
  { sunElevation: -0.3, factor: 0.85 },
  { sunElevation: -0.5, factor: 1 }, // well into night
  { sunElevation: -1, factor: 1 },
]

const BASE_OPACITY = 0.92
const BASE_GLOW = 0.18
const MOONLIGHT_FLOOR = 0.5 // even a fully-visible full moon only suppresses downstream fades to 50%, never to 0
const VISIBLE_THRESHOLD = 0.02

/**
 * The Environment Engine's moon layer: turns EnvironmentState + CelestialState
 * into the one MoonState the Hero scene renders. This is the only place the
 * moon's position, phase, and visibility are decided — Moon.jsx applies
 * MoonState, it never computes any of this itself.
 *
 * Also the first celestial *light source* in this engine: `moonlightFade`
 * is exposed specifically so other celestial renderers (deriveMilkyWay.js
 * today, future ones later) can react to real moon brightness without each
 * recomputing phase/illumination/visibility themselves — see Hero.jsx,
 * which computes `moon` before `milkyWay` and threads `moon.moonlightFade`
 * into deriveMilkyWay() as a result.
 *
 * @param {EnvironmentState} [environment]
 * @param {CelestialState} [celestial] - defaults to deriveCelestial() at the
 *   current instant; pass an explicit one to share a single computed
 *   CelestialState across multiple derive calls (see Hero.jsx) or for tests
 * @returns {MoonState}
 */
export function deriveMoon(environment = DEFAULT_ENVIRONMENT, celestial = deriveCelestial()) {
  const phase = computePhase(celestial.date)
  const phaseName = phaseNameFor(phase)
  const illumination = illuminationFor(phase)

  const hourAngle = moonHourAngle(celestial.localHour, phase)
  const altitudeRaw = moonAltitudeRaw(hourAngle)
  const azimuthProgress = clamp01((hourAngle - 6) / 12) // 0 at rise, 1 at set; meaningful only while altitudeRaw > 0

  const altitude = altitudeRaw * 90
  const azimuth = azimuthProgress * 180 + 90

  const x = lerp(ARC_X_START, ARC_X_END, azimuthProgress)
  const y = ARC_Y_HORIZON - clamp01(altitudeRaw) * (ARC_Y_HORIZON - ARC_Y_ZENITH)

  const positionFade = positionFadeFactor(altitudeRaw)
  const cloudFade = interpolate(CLOUD_FADE_KEYFRAMES, 'cloudDensity', 'factor', clamp01((environment.cloudDensity ?? 0) / 100) * 100)
  const weatherFade = weatherFadeFactor(environment)
  const daylightFade = interpolate(DAYLIGHT_FADE_KEYFRAMES, 'sunElevation', 'factor', celestial.sunElevation)

  const overallVisibility = positionFade * cloudFade * weatherFade * daylightFade
  const visible = overallVisibility * BASE_OPACITY > VISIBLE_THRESHOLD

  // How much this moon suppresses fainter celestial objects (Milky Way,
  // future stars): scales with both how illuminated it is and how exposed
  // it currently is — an occluded or below-horizon moon casts no light,
  // regardless of phase.
  const moonlightFade = clamp01(1 - (1 - MOONLIGHT_FLOOR) * illumination * overallVisibility)

  return {
    visible,
    x,
    y,
    altitude,
    azimuth,
    phase,
    phaseName,
    illumination,
    opacity: BASE_OPACITY,
    size: 1,
    glow: BASE_GLOW,
    positionFade,
    cloudFade,
    weatherFade,
    daylightFade,
    moonlightFade,
  }
}
