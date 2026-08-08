// Lake Tekapo village. Duplicated (not imported) from TEKAPO_CENTER in
// src/components/guide/mapConstants.js on purpose — that file is guide-page
// specific, and the Environment Engine is a different layer that shouldn't
// depend on it. Both describe the same physical point; if Tekapo's
// coordinates ever needed correcting, both call sites would need the fix.
const TEKAPO_LATITUDE = -44.0068
const TEKAPO_LONGITUDE = 170.4779

const OPEN_METEO_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'

// Only the "current" fields the Environment Engine actually maps (see
// deriveEnvironment.js) — no temperature, no hourly arrays, nothing unused.
// cloud_cover is available directly on `current`, so no separate hourly
// request is needed just to get it.
const CURRENT_FIELDS = ['weather_code', 'cloud_cover', 'wind_speed_10m', 'precipitation', 'is_day'].join(',')

/**
 * @typedef {Object} RawWeather
 * @property {number} weatherCode - WMO weather code (open-meteo.com/en/docs)
 * @property {number} cloudCover - total cloud cover, percent (0-100)
 * @property {number} windSpeedKmh - 10m wind speed, km/h
 * @property {number} precipitationMm - precipitation in the last hour, mm
 * @property {boolean} isDay - whether it's currently daytime at Lake Tekapo
 * @property {string} time - ISO timestamp of this reading (Tekapo local time)
 */

/**
 * Fetches current weather for Lake Tekapo from Open-Meteo — a single
 * request, keyless (Open-Meteo's forecast endpoint is free and open for
 * this kind of low-volume, non-commercial use). This is the only place in
 * the app that talks to Open-Meteo; everything else consumes its output
 * through deriveEnvironment().
 *
 * Throws on network failure, a non-OK response, or a malformed payload —
 * callers (useEnvironmentState) are responsible for catching this and
 * falling back gracefully.
 *
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<RawWeather>}
 */
export async function fetchEnvironment({ signal } = {}) {
  const url = new URL(OPEN_METEO_ENDPOINT)
  url.searchParams.set('latitude', TEKAPO_LATITUDE)
  url.searchParams.set('longitude', TEKAPO_LONGITUDE)
  url.searchParams.set('current', CURRENT_FIELDS)
  url.searchParams.set('wind_speed_unit', 'kmh')
  url.searchParams.set('precipitation_unit', 'mm')
  url.searchParams.set('timezone', 'Pacific/Auckland')

  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`)
  }

  const payload = await response.json()
  const current = payload?.current
  if (!current) {
    throw new Error('Open-Meteo response was missing "current" data')
  }

  return {
    weatherCode: current.weather_code,
    cloudCover: current.cloud_cover,
    windSpeedKmh: current.wind_speed_10m,
    precipitationMm: current.precipitation,
    isDay: current.is_day === 1,
    time: current.time,
  }
}
