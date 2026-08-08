import { DEFAULT_ENVIRONMENT } from './defaultEnvironment'

/**
 * @typedef {import('../../types/environment.js').EnvironmentState} EnvironmentState
 */

/**
 * Concrete, CSS/SVG-ready lighting values for the Hero scene. Deliberately
 * not the same shape as EnvironmentState.lighting (see deriveEnvironment.js)
 * — that field is abstract *intent* data (part of the single source of
 * truth); this is a presentation-layer *recipe* for the specific SVG+CSS
 * illustration LakeIllustration renders. If the Hero's rendering approach
 * ever changes (e.g. to WebGL), this file — not EnvironmentState — is what
 * would need new fields.
 *
 * @typedef {Object} LightingConfig
 * @property {number} exposure - CSS `brightness()` multiplier for the scene
 * @property {number} saturation - CSS `saturate()` multiplier for the scene
 * @property {string} tintColor - hex color for the ambient color-grade wash
 * @property {number} tintOpacity - 0-1, how strongly tintColor is applied
 */

// One preset per TimeOfDay, tuned by eye against the actual sky/mountain
// gradient in LakeIllustration.jsx — not scientific values, just a mood per
// time of day. Kept modest (exposure 0.6-1.15, tintOpacity <= 0.22) so the
// gradient's dark navy band — where the Hero's white text sits — never gets
// bright enough to threaten text contrast; see Hero.jsx/LakeIllustration.jsx.
const LIGHTING_PRESETS = {
  // Soft sunrise: medium brightness, gentle warm horizon tint.
  morning: { exposure: 0.85, saturation: 0.95, tintColor: '#FFD9A8', tintOpacity: 0.1 },
  // Bright clear daylight: brightest, neutral color, minimal tint.
  afternoon: { exposure: 1.15, saturation: 1.05, tintColor: '#FAFAF8', tintOpacity: 0.05 },
  // Golden hour: warm, dimmer, richer color.
  evening: { exposure: 0.75, saturation: 1.1, tintColor: '#C8A85A', tintOpacity: 0.22 },
  // Moonlit night: dark blue, much dimmer, cool — this is close to the
  // scene's original always-on Phase 1 look.
  night: { exposure: 0.62, saturation: 0.9, tintColor: '#0B1F33', tintOpacity: 0.15 },
}

/**
 * The Environment Engine's lighting layer: turns an EnvironmentState into
 * the one LightingConfig the Hero scene renders. This is the only place a
 * lighting preset is chosen — components apply LightingConfig, they never
 * pick colors/brightness themselves or branch on `timeOfDay` directly.
 *
 * `timeOfDay` is the primary driver (one of the four presets above).
 * `environment.lighting.brightness` — already weather-adjusted by
 * deriveEnvironment() — nudges exposure by up to ±10% so cloud cover has a
 * believable but non-dominant effect. No raw weather is interpreted here;
 * this only reshapes values EnvironmentState already carries into the shape
 * the Hero's SVG/CSS rendering needs.
 *
 * @param {EnvironmentState} [environment]
 * @returns {LightingConfig}
 */
export function deriveLighting(environment = DEFAULT_ENVIRONMENT) {
  const preset = LIGHTING_PRESETS[environment.timeOfDay] ?? LIGHTING_PRESETS.night
  const cloudNudge = 0.85 + (environment.lighting?.brightness ?? 0.5) * 0.2 // 0.85–1.05

  return {
    ...preset,
    exposure: preset.exposure * cloudNudge,
  }
}
