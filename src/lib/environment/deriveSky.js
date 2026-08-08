import { DEFAULT_ENVIRONMENT } from './defaultEnvironment'
import { deriveCelestial } from './deriveCelestial'

/**
 * @typedef {import('../../types/environment.js').EnvironmentState} EnvironmentState
 * @typedef {import('./deriveCelestial.js').CelestialState} CelestialState
 */

/**
 * A single anchor point in the day's color arc. Not exported — an
 * implementation detail of the keyframe table below.
 * @typedef {Object} SkyKeyframe
 * @property {number} hour - Tekapo local decimal hour, 0-24 (24 == 0, closes the loop)
 * @property {SkyStage} stage
 * @property {string} topColor - hex
 * @property {string} horizonColor - hex
 * @property {number} brightness - 0-1
 * @property {number} gradientStrength - 0-1
 */

/**
 * @typedef {'night' | 'dawn' | 'morning' | 'noon' | 'afternoon' | 'goldenHour' | 'sunset' | 'blueHour'} SkyStage
 *
 * Deliberately a separate, finer-grained vocabulary from EnvironmentState's
 * existing `TimeOfDay` (morning/afternoon/evening/night — see types/environment.js),
 * not a replacement for it. `TimeOfDay` still drives deriveLighting()/
 * deriveClouds() unchanged; `SkyStage` exists only for the sky gradient's
 * own, more continuous day-cycle model. The two intentionally don't unify in
 * this phase — doing so would mean touching deriveEnvironment.js's
 * TimeOfDay-consuming logic, which is explicitly out of scope here.
 */

/**
 * @typedef {Object} SkyGradientStop
 * @property {string} offset - CSS percentage string, e.g. "42%"
 * @property {string} color - hex
 */

/**
 * Concrete, render-ready sky data. `stops` is fully pre-computed (from
 * topColor/horizonColor/gradientStrength) so the renderer never blends
 * colors itself — see LakeIllustration.jsx, which only maps this array to
 * <stop> elements.
 *
 * @typedef {Object} SkyState
 * @property {SkyStage} stage - nearest named stage; a label only, colors are
 *   already continuously interpolated regardless of which stage is "current"
 * @property {string} topColor - hex, sky color at the top of the gradient
 * @property {string} horizonColor - hex, sky color at the horizon
 * @property {number} brightness - 0-1, ambient daylight level right now.
 *   NOT applied anywhere in this phase — it doesn't touch the existing
 *   `lighting`/CSS-filter pipeline (deriveLighting.js) at all. Exposed as a
 *   forward-looking signal for future consumers (e.g. star opacity fading
 *   in as the sky darkens).
 * @property {number} gradientStrength - 0-1, how pronounced the top→horizon
 *   shift is (low = flat midday sky, high = dramatic dawn/dusk gradient)
 * @property {SkyGradientStop[]} stops - ready to render, same 4 offsets the
 *   original static gradient used (0%/42%/72%/100%)
 */

// Fixed representative clock times, not tied to actual sunrise/sunset for
// any given date — deliberately no seasonal variation (out of scope for
// this phase; see the "Future extension points" note in the PR summary for
// where real solar-position data would plug in later).
//
// Colors chosen to blend smoothly through all 8 named stages while staying
// close to the existing palette where it made sense (afternoon reuses
// --color-lake's #2D6E92). hour 24 duplicates hour 0 to close the loop.
const SKY_KEYFRAMES = [
  { hour: 0, stage: 'night', topColor: '#060B16', horizonColor: '#0E1D33', brightness: 0.05, gradientStrength: 0.5 },
  { hour: 4.5, stage: 'night', topColor: '#060B16', horizonColor: '#0E1D33', brightness: 0.05, gradientStrength: 0.5 },
  { hour: 6, stage: 'dawn', topColor: '#241B3D', horizonColor: '#7A5A8F', brightness: 0.18, gradientStrength: 0.9 },
  { hour: 7, stage: 'dawn', topColor: '#3B2A55', horizonColor: '#E8A15C', brightness: 0.28, gradientStrength: 1 },
  { hour: 8, stage: 'morning', topColor: '#3E71A8', horizonColor: '#BFE1F2', brightness: 0.55, gradientStrength: 0.75 },
  { hour: 10.5, stage: 'morning', topColor: '#2E7FC7', horizonColor: '#AEE0F5', brightness: 0.78, gradientStrength: 0.6 },
  { hour: 12.5, stage: 'noon', topColor: '#1E6FC9', horizonColor: '#8FCBEF', brightness: 1, gradientStrength: 0.45 },
  { hour: 15, stage: 'afternoon', topColor: '#2D6E92', horizonColor: '#A9D2E4', brightness: 0.82, gradientStrength: 0.55 },
  { hour: 17, stage: 'goldenHour', topColor: '#3E6B8F', horizonColor: '#F3B15E', brightness: 0.55, gradientStrength: 0.85 },
  { hour: 18.3, stage: 'sunset', topColor: '#4A3B6B', horizonColor: '#E8633F', brightness: 0.32, gradientStrength: 1 },
  { hour: 19.3, stage: 'sunset', topColor: '#3A2B54', horizonColor: '#A93A4E', brightness: 0.18, gradientStrength: 1 },
  { hour: 20.3, stage: 'blueHour', topColor: '#1B2646', horizonColor: '#3F4B7A', brightness: 0.1, gradientStrength: 0.7 },
  { hour: 21.5, stage: 'night', topColor: '#0A1120', horizonColor: '#12203A', brightness: 0.06, gradientStrength: 0.55 },
  { hour: 24, stage: 'night', topColor: '#060B16', horizonColor: '#0E1D33', brightness: 0.05, gradientStrength: 0.5 },
]

// Same 4 stop offsets the original static gradient used (see
// LakeIllustration.jsx history) — kept identical so only color, never
// composition, changes.
const STOP_OFFSETS = [0, 0.42, 0.72, 1]

const clamp01 = (value) => Math.min(1, Math.max(0, value))
const lerp = (a, b, t) => a + (b - a) * t

function hexToRgb(hex) {
  const value = hex.replace('#', '')
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

function rgbToHex({ r, g, b }) {
  const toHex = (n) => Math.round(clamp01(n / 255) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)
  return rgbToHex({ r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) })
}

function findBracket(hour) {
  for (let i = 0; i < SKY_KEYFRAMES.length - 1; i++) {
    if (hour >= SKY_KEYFRAMES[i].hour && hour <= SKY_KEYFRAMES[i + 1].hour) {
      return [SKY_KEYFRAMES[i], SKY_KEYFRAMES[i + 1]]
    }
  }
  // Unreachable given SKY_KEYFRAMES spans [0, 24] and hour is normalized to
  // that range, but keeps the function total rather than possibly returning
  // undefined.
  return [SKY_KEYFRAMES[SKY_KEYFRAMES.length - 2], SKY_KEYFRAMES[SKY_KEYFRAMES.length - 1]]
}

/** Blends topColor→horizonColor at each fixed stop offset, weighted by
 *  gradientStrength — a low value keeps every stop close to topColor (a
 *  flat, uniform midday sky), a high value lets later stops reach all the
 *  way to horizonColor (a dramatic dawn/dusk gradient). Pre-computed here,
 *  not in the renderer — see the SkyState doc comment. */
function buildStops(topColor, horizonColor, gradientStrength) {
  return STOP_OFFSETS.map((offset) => ({
    offset: `${offset * 100}%`,
    color: lerpColor(topColor, horizonColor, clamp01(offset * gradientStrength)),
  }))
}

/**
 * The Environment Engine's sky layer: turns the current moment into the one
 * SkyState the Hero scene renders. This is the only place sky color is
 * decided — the renderer applies SkyState, it never picks or blends colors
 * itself.
 *
 * Time comes from a CelestialState (src/lib/environment/deriveCelestial.js —
 * the shared source of truth future celestial renderers will read from too),
 * not from a raw Date directly. That's what makes true continuous
 * interpolation possible in the first place: EnvironmentState's existing
 * `timeOfDay` is a 4-bucket value with hard thresholds baked in (see
 * deriveEnvironment.js's timeOfDayFromHour()), and reusing it here would
 * reproduce exactly the "abrupt switching" this system is built to avoid.
 * `environment` is still accepted (kept first, matching every other derive
 * function's signature) but unused in this phase — reserved for a future
 * weather-modulated sky (e.g. overcast skies desaturating) without another
 * signature change.
 *
 * @param {EnvironmentState} [_environment] - accepted for signature
 *   consistency with deriveLighting()/deriveClouds()/etc.; not read yet
 * @param {CelestialState} [celestial] - defaults to deriveCelestial() at the
 *   current instant; pass an explicit one to share a single computed
 *   CelestialState across multiple derive calls (see Hero.jsx) or for tests
 * @returns {SkyState}
 */
export function deriveSky(_environment = DEFAULT_ENVIRONMENT, celestial = deriveCelestial()) {
  const hour = celestial.localHour
  const [a, b] = findBracket(hour)
  const span = b.hour - a.hour
  const t = span === 0 ? 0 : clamp01((hour - a.hour) / span)

  const topColor = lerpColor(a.topColor, b.topColor, t)
  const horizonColor = lerpColor(a.horizonColor, b.horizonColor, t)
  const brightness = clamp01(lerp(a.brightness, b.brightness, t))
  const gradientStrength = clamp01(lerp(a.gradientStrength, b.gradientStrength, t))

  return {
    stage: t < 0.5 ? a.stage : b.stage,
    topColor,
    horizonColor,
    brightness,
    gradientStrength,
    stops: buildStops(topColor, horizonColor, gradientStrength),
  }
}
