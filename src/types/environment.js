/**
 * Shape of the "environment" describing the Hero's Lake Tekapo scene:
 * time of day, weather, season, lighting, and which decorative effects are
 * active. Produced by src/lib/environment/deriveEnvironment.js from live
 * Open-Meteo data (src/lib/environment/fetchEnvironment.js), read (never
 * computed) by src/components/sections/Hero.jsx and the graphics it renders.
 * Documented here (JSDoc only — the project is plain JS/JSX, not TypeScript)
 * so editors can still surface field names/types via intellisense.
 *
 * Phase 2A note: this is now populated from real data, but nothing renders
 * off of it yet — LakeIllustration/FloatingParticles still render their
 * fixed Phase 1 artwork regardless of these values. New weatherType/effect
 * values can keep landing here as later phases need them.
 *
 * @typedef {'morning' | 'afternoon' | 'evening' | 'night'} TimeOfDay
 *
 * @typedef {'clear' | 'partly-cloudy' | 'cloudy' | 'overcast' | 'rain' | 'snow' | 'fog' | 'storm'} WeatherType
 *
 * @typedef {'spring' | 'summer' | 'autumn' | 'winter'} Season
 *
 * @typedef {Object} Precipitation
 * @property {'none' | 'rain' | 'snow'} type
 * @property {number} intensity - 0 (none) to 1 (heaviest)
 *
 * @typedef {Object} Lighting
 * @property {number} brightness - 0 (darkest) to 1 (brightest)
 * @property {string} tint - CSS color hint for ambient light color grading
 * @property {boolean} sunVisible
 * @property {boolean} moonVisible
 *
 * @typedef {Object} EnvironmentEffects
 * @property {boolean} stars
 * @property {boolean} moon
 * @property {boolean} aurora
 * @property {boolean} shootingStars
 * @property {boolean} birds
 * @property {boolean} snow
 * @property {boolean} fog
 *
 * @typedef {Object} EnvironmentState
 * @property {TimeOfDay} timeOfDay
 * @property {WeatherType} weatherType
 * @property {number} cloudDensity - percent of sky covered, 0-100
 * @property {Precipitation} precipitation
 * @property {number} windStrength - 10m wind speed, km/h (0 = calm)
 * @property {Season} season
 * @property {Lighting} lighting
 * @property {EnvironmentEffects} effects
 */

export {}
