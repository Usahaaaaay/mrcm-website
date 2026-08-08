import { DEFAULT_ENVIRONMENT } from './defaultEnvironment'

/**
 * @typedef {import('../../types/environment.js').EnvironmentState} EnvironmentState
 */

/**
 * Per-slot visibility. Deliberately position-agnostic — this file only
 * decides *how visible* each cloud puff is, never *where* it sits.
 * Coordinates are a rendering/artwork concern owned by LakeIllustration's
 * own `CLOUD_SLOTS` array, same as how the existing `stars` layout works.
 *
 * @typedef {Object} CloudPuff
 * @property {number} opacity - 0-1, this puff's current visibility
 */

/**
 * Concrete, CSS/SVG-ready cloud values for the Hero scene. Same philosophy
 * as LightingConfig (deriveLighting.js): abstract EnvironmentState data in,
 * a presentation-layer recipe out. `puffs.length` always equals
 * CLOUD_SLOT_COUNT, in the same order LakeIllustration's CLOUD_SLOTS array
 * lists its cloud positions, so the component can zip the two without any
 * cloud-density math of its own.
 *
 * @typedef {Object} CloudConfig
 * @property {number} opacity - 0-1 ceiling opacity for a fully-active puff
 * @property {number} scale - shared size multiplier (>=1) for every puff
 * @property {number} softnessPx - shared blur radius (px) for every puff's edge
 * @property {CloudPuff[]} puffs - one entry per LakeIllustration cloud slot
 */

export const CLOUD_SLOT_COUNT = 8

// Each slot "wakes up" at a different cloudDensity and ramps to full
// opacity over RAMP_WIDTH points, so cloud cover accumulates progressively
// — a couple of scattered puffs at low density, most/all of them solid by
// the time density reaches 100 — instead of the whole layer popping in at
// once. Spaced so the last slot finishes ramping exactly at density 100.
const SLOT_THRESHOLDS = [0, 11, 22, 33, 44, 56, 67, 78]
const RAMP_WIDTH = 22

const clamp01 = (value) => Math.min(1, Math.max(0, value))

/**
 * The Environment Engine's cloud layer: turns EnvironmentState.cloudDensity
 * into the one CloudConfig the Hero scene renders. This is the only place
 * cloud coverage is interpreted — components apply CloudConfig, they never
 * read cloudDensity or branch on weather themselves.
 *
 * Uses only `environment.cloudDensity` — already computed by
 * deriveEnvironment() from live Open-Meteo data. No new weather
 * calculation, no network access, nothing re-derived that deriveEnvironment
 * already owns.
 *
 * @param {EnvironmentState} [environment]
 * @returns {CloudConfig}
 */
export function deriveClouds(environment = DEFAULT_ENVIRONMENT) {
  const density = environment.cloudDensity ?? 0 // 0-100
  const amount = clamp01(density / 100)

  const puffs = SLOT_THRESHOLDS.map((threshold) => ({
    opacity: clamp01((density - threshold) / RAMP_WIDTH),
  }))

  return {
    opacity: 0.55 + amount * 0.35, // 0.55-0.9 — never a flat opaque wall, stays illustrative
    scale: 1 + amount * 0.25, // fuller-looking puffs as coverage increases
    softnessPx: 6 - amount * 4.5, // hazier/softer when sparse, more defined when dense
    puffs,
  }
}
