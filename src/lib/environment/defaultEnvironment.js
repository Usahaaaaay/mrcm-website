/**
 * @typedef {import('../../types/environment.js').EnvironmentState} EnvironmentState
 */

/**
 * The safe fallback EnvironmentState: calm, clear, starlit — a snapshot
 * that matches what LakeIllustration/FloatingParticles have always rendered
 * unconditionally, so it never looks "wrong" no matter what's live.
 *
 * Used in two places by useEnvironmentState():
 *  1. As the initial state, before the first Open-Meteo fetch resolves.
 *  2. Implicitly kept on screen (not reassigned here) if a later fetch
 *     fails — the hook simply leaves whatever EnvironmentState is already
 *     showing in place rather than reverting to this, so a live scene never
 *     "flashes" back to placeholder values because of a network hiccup.
 *
 * @type {EnvironmentState}
 */
export const DEFAULT_ENVIRONMENT = {
  timeOfDay: 'night',
  weatherType: 'clear',
  cloudDensity: 0,
  precipitation: { type: 'none', intensity: 0 },
  windStrength: 0,
  season: 'winter',
  lighting: {
    brightness: 0.5,
    tint: '#FAFAF8',
    sunVisible: false,
    moonVisible: true,
  },
  effects: {
    stars: true,
    moon: true,
    aurora: false,
    shootingStars: false,
    birds: false,
    snow: false,
    fog: false,
  },
}
