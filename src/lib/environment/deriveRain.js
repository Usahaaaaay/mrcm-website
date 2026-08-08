import { DEFAULT_ENVIRONMENT } from './defaultEnvironment'

/**
 * @typedef {import('../../types/environment.js').EnvironmentState} EnvironmentState
 */

/**
 * @typedef {Object} RainState
 * @property {boolean} enabled - whether the rain layer should render at all
 * @property {number} intensity - 0-1, how heavy the rainfall is
 */

// Used only if EnvironmentState.precipitation is ever missing — deriveEnvironment()
// always sets it today, so this is a defensive fallback, not the normal path.
const FALLBACK_INTENSITY = 0.5

const clamp01 = (value) => Math.min(1, Math.max(0, value))

/**
 * The Environment Engine's rain layer: turns EnvironmentState into the one
 * RainState the Hero scene renders. This is the only place rain is decided
 * — components apply RainState, they never read weatherType/precipitation
 * or inspect weather codes themselves.
 *
 * Primary source is environment.precipitation — already computed by
 * deriveEnvironment() from live Open-Meteo data (see derivePrecipitation()
 * there), so no weather calculation is duplicated here. If precipitation is
 * ever missing, falls back to inferring rain from environment.weatherType
 * alone, per the brief.
 *
 * Independent of deriveLighting() and deriveClouds() — none of the three
 * read each other's output, only EnvironmentState.
 *
 * @param {EnvironmentState} [environment]
 * @returns {RainState}
 */
export function deriveRain(environment = DEFAULT_ENVIRONMENT) {
  const precipitation = environment.precipitation

  if (precipitation) {
    return {
      enabled: precipitation.type === 'rain',
      intensity: clamp01(precipitation.intensity ?? 0),
    }
  }

  const isRainyWeather = environment.weatherType === 'rain' || environment.weatherType === 'storm'
  return { enabled: isRainyWeather, intensity: isRainyWeather ? FALLBACK_INTENSITY : 0 }
}
