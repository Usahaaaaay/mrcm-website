import { DEFAULT_ENVIRONMENT } from './defaultEnvironment'

/**
 * @typedef {import('../../types/environment.js').EnvironmentState} EnvironmentState
 * @typedef {import('./fetchEnvironment.js').RawWeather} RawWeather
 */

const TEKAPO_TIME_ZONE = 'Pacific/Auckland'

// WMO weather codes → our WeatherType. See open-meteo.com/en/docs for the
// full table; codes not listed here (there are gaps) fall through to
// 'clear' rather than throwing, since a scene should never break over an
// unrecognized code.
const CLEAR_CODES = new Set([0, 1])
const PARTLY_CLOUDY_CODES = new Set([2])
const OVERCAST_CODES = new Set([3])
const FOG_CODES = new Set([45, 48])
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82])
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86])
const STORM_CODES = new Set([95, 96, 99])

// mm of precipitation (last hour) treated as "heaviest" for intensity 1 —
// rough real-world thresholds, not a scientific scale.
const RAIN_MM_AT_MAX_INTENSITY = 4
const SNOW_MM_AT_MAX_INTENSITY = 2

const TINT_BY_TIME_OF_DAY = {
  morning: '#FFE9C7',
  afternoon: '#FAFAF8',
  evening: '#C8A85A',
  night: '#102A43',
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/** @param {number} code @returns {import('../../types/environment.js').WeatherType} */
function weatherTypeFromCode(code) {
  if (CLEAR_CODES.has(code)) return 'clear'
  if (PARTLY_CLOUDY_CODES.has(code)) return 'partly-cloudy'
  if (OVERCAST_CODES.has(code)) return 'overcast'
  if (FOG_CODES.has(code)) return 'fog'
  if (RAIN_CODES.has(code)) return 'rain'
  if (SNOW_CODES.has(code)) return 'snow'
  if (STORM_CODES.has(code)) return 'storm'
  return 'clear'
}

/** @returns {import('../../types/environment.js').TimeOfDay} */
function timeOfDayFromHour(hour) {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

/** @returns {import('../../types/environment.js').Season} - Southern Hemisphere (Lake Tekapo is in NZ) */
function seasonFromMonth(month) {
  if (month === 12 || month <= 2) return 'summer'
  if (month <= 5) return 'autumn'
  if (month <= 8) return 'winter'
  return 'spring'
}

/** Lake Tekapo's local hour (0-23) and month (1-12) for a given instant,
 *  independent of the visitor's own timezone — the scene reflects Tekapo,
 *  not wherever the site is being viewed from. */
function getTekapoParts(date) {
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: TEKAPO_TIME_ZONE,
    hour: 'numeric',
    hour12: false,
    month: 'numeric',
  }).formatToParts(date)

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0) % 24
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? 1)
  return { hour, month }
}

/** @returns {import('../../types/environment.js').Precipitation} */
function derivePrecipitation(weatherType, precipitationMm) {
  const mm = Math.max(0, precipitationMm ?? 0)
  if (weatherType === 'snow') {
    return { type: 'snow', intensity: clamp(mm / SNOW_MM_AT_MAX_INTENSITY, 0, 1) }
  }
  if (weatherType === 'rain' || weatherType === 'storm') {
    return { type: 'rain', intensity: clamp(mm / RAIN_MM_AT_MAX_INTENSITY, 0, 1) }
  }
  return { type: 'none', intensity: 0 }
}

/** @returns {import('../../types/environment.js').Lighting} */
function deriveLighting(timeOfDay, cloudDensity, isDay) {
  const baseBrightness = timeOfDay === 'night' ? 0.15 : timeOfDay === 'evening' ? 0.4 : 0.9
  const cloudDimming = 1 - (cloudDensity / 100) * 0.5 // overcast dims, never fully blacks out
  return {
    brightness: clamp(baseBrightness * cloudDimming, 0, 1),
    tint: TINT_BY_TIME_OF_DAY[timeOfDay],
    sunVisible: isDay && cloudDensity < 80,
    moonVisible: !isDay,
  }
}

/** @returns {import('../../types/environment.js').EnvironmentEffects} */
function deriveEffects(timeOfDay, weatherType, cloudDensity) {
  const isNight = timeOfDay === 'night'
  return {
    stars: isNight && cloudDensity < 50,
    moon: isNight || timeOfDay === 'evening',
    // No live data source for these yet (aurora activity index, meteor
    // shower calendar, bird migration) — reserved for a later phase.
    aurora: false,
    shootingStars: false,
    birds: false,
    snow: weatherType === 'snow',
    fog: weatherType === 'fog',
  }
}

/**
 * The Environment Engine's single entry point: turns raw Open-Meteo data
 * into the one EnvironmentState the Hero and its graphics render. This is
 * the only function that should ever decide what the scene *is* —
 * components consume its output, they never interpret raw weather
 * themselves.
 *
 * `raw` is `null` when there's no live data yet (before the first fetch
 * resolves), in which case this returns the static DEFAULT_ENVIRONMENT.
 * useEnvironmentState() is responsible for *not* calling this again with
 * `null` after a failed refresh — a network hiccup should leave the
 * previous EnvironmentState on screen, not reset it.
 *
 * @param {RawWeather | null} [raw]
 * @param {Date} [now] - defaults to the current instant; overridable for tests
 * @returns {EnvironmentState}
 */
export function deriveEnvironment(raw = null, now = new Date()) {
  if (!raw) return DEFAULT_ENVIRONMENT

  const { hour, month } = getTekapoParts(now)
  const timeOfDay = timeOfDayFromHour(hour)
  const season = seasonFromMonth(month)
  const weatherType = weatherTypeFromCode(raw.weatherCode)
  const cloudDensity = Math.round(clamp(raw.cloudCover ?? 0, 0, 100))
  const windStrength = Math.max(0, raw.windSpeedKmh ?? 0)

  return {
    timeOfDay,
    weatherType,
    cloudDensity,
    precipitation: derivePrecipitation(weatherType, raw.precipitationMm),
    windStrength,
    season,
    lighting: deriveLighting(timeOfDay, cloudDensity, raw.isDay),
    effects: deriveEffects(timeOfDay, weatherType, cloudDensity),
  }
}
