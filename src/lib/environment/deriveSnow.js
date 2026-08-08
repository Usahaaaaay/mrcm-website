import { DEFAULT_ENVIRONMENT } from './defaultEnvironment'

/**
 * @typedef {import('../../types/environment.js').EnvironmentState} EnvironmentState
 */

/**
 * @typedef {Object} SnowState
 * @property {boolean} enabled - whether the snow layer should render at all
 * @property {number} intensity - 0-1, how heavy the snowfall is
 * @property {number} particleCount - how many flakes Snow.jsx should render
 * @property {number} opacity - 0-1, ceiling opacity for a fully-active flake
 * @property {number} drift - px of horizontal sway amplitude, scales with intensity
 * @property {number} speed - fall-speed multiplier (snow is deliberately slow — see Snow.jsx)
 * @property {number} seed - fixed seed for deterministic flake generation
 */

// Used only if EnvironmentState.precipitation is ever missing — deriveEnvironment()
// always sets it today, so this is a defensive fallback, not the normal path.
// (Mirrors deriveRain.js's fallback exactly. Not extracted into a shared
// helper: this phase is required to leave the completed Rain renderer
// untouched, and a shared util only one of the two call sites actually used
// would be worse than the few duplicated lines — see Phase 2B.3B notes.)
const FALLBACK_INTENSITY = 0.5

const clamp01 = (value) => Math.min(1, Math.max(0, value))

// Three checkpoints from the brief (light≈40, moderate≈80, heavy≈150),
// piecewise-interpolated across the full 0-1 intensity range rather than a
// single hardcoded count.
const LIGHT_PARTICLES = 40
const MODERATE_PARTICLES = 80
const HEAVY_PARTICLES = 150

function particleCountForIntensity(intensity) {
  if (intensity <= 0.5) {
    return Math.round(LIGHT_PARTICLES + (MODERATE_PARTICLES - LIGHT_PARTICLES) * (intensity / 0.5))
  }
  return Math.round(MODERATE_PARTICLES + (HEAVY_PARTICLES - MODERATE_PARTICLES) * ((intensity - 0.5) / 0.5))
}

// Fixed on purpose. "Deterministic" here means Snow.jsx's seeded flake
// generator produces the same sequence of flake attributes every time it
// runs, so the layout doesn't jump to a visually distinct random
// arrangement on every ~12-minute live refresh — not that real-time falling
// motion is frame-identical across sessions (it can't be; rAF timing is
// wall-clock). Varying the seed meaningfully (e.g. per calendar day) is a
// natural follow-up, not needed for this phase.
const SNOW_SEED = 20260101

/**
 * The Environment Engine's snow layer: turns EnvironmentState into the one
 * SnowState the Hero scene renders. This is the only place snow is decided
 * — components apply SnowState, they never read weatherType/precipitation
 * or inspect weather codes themselves.
 *
 * Primary source is environment.precipitation — already computed by
 * deriveEnvironment() from live Open-Meteo data — so no weather calculation
 * is duplicated here. Falls back to environment.weatherType alone if
 * precipitation is ever missing.
 *
 * Independent of deriveLighting(), deriveClouds(), and deriveRain() — none
 * of the four read each other's output, only EnvironmentState. Rain and
 * snow can never both be enabled: deriveEnvironment() always sets
 * environment.precipitation.type to exactly one of 'none' | 'rain' | 'snow',
 * and deriveRain()/deriveSnow() each check a different one of those two
 * mutually exclusive values.
 *
 * @param {EnvironmentState} [environment]
 * @returns {SnowState}
 */
export function deriveSnow(environment = DEFAULT_ENVIRONMENT) {
  const precipitation = environment.precipitation

  let enabled
  let intensity
  if (precipitation) {
    enabled = precipitation.type === 'snow'
    intensity = clamp01(precipitation.intensity ?? 0)
  } else {
    enabled = environment.weatherType === 'snow'
    intensity = enabled ? FALLBACK_INTENSITY : 0
  }

  return {
    enabled,
    intensity,
    particleCount: enabled ? particleCountForIntensity(intensity) : 0,
    opacity: 0.55 + intensity * 0.35, // 0.55-0.9 — soft, never a flat white wall
    drift: 12 + intensity * 6, // heavier snow sways a little more
    speed: 0.5 + intensity * 0.5, // slow and soft even at maximum intensity
    seed: SNOW_SEED,
  }
}
