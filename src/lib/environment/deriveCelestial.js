const TEKAPO_TIME_ZONE = 'Pacific/Auckland'

const clamp01 = (value) => Math.min(1, Math.max(0, value))

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/** Tekapo's local time as a decimal hour (e.g. 14.5 for 2:30pm), independent
 *  of the visitor's own timezone. Moved here verbatim from deriveSky.js —
 *  this is now the one canonical copy; deriveSky.js no longer has its own. */
function getTekapoDecimalHour(date) {
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: TEKAPO_TIME_ZONE,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(date)

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0) % 24
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return hour + minute / 60
}

/**
 * The shared, minimal "what time is it / how much daylight is there" model —
 * the single source of truth every celestial renderer (sky today; stars,
 * moon, Milky Way, aurora, atmospheric scattering later) should read time
 * from, instead of each computing Tekapo's local time independently.
 *
 * Deliberately small: no astronomy, no real solar geometry, no lunar
 * calculations — `sunElevation` is a stylized sine proxy, not a real
 * elevation angle, and is documented as such so nothing downstream mistakes
 * it for one. Renderers that need actual solar/lunar physics will compute
 * that themselves, off of `date`, when that phase happens.
 *
 * @typedef {Object} CelestialState
 * @property {Date} date - the instant this was derived from, unchanged — so
 *   a future consumer that needs full calendar context (e.g. day-of-year for
 *   a moon phase) has it, without this module knowing what moon phase is
 * @property {number} localHour - 0-24, Tekapo local decimal hour
 * @property {number} dayProgress - 0-1, localHour/24 — the same information
 *   as localHour, just normalized; kept because it's the more directly
 *   useful shape for interpolation-style consumers (lerp/shader-style code)
 * @property {number} sunElevation - -1 (midnight) to 1 (solar noon), a
 *   stylized sine curve standing in for "how high the sun conceptually is."
 *   NOT real solar geometry — no latitude/declination/hour-angle math.
 * @property {number} daylightAmount - 0-1, a smoothed day/night signal
 *   (soft twilight transition rather than a sharp cutoff) — the general
 *   "how bright should the scene feel" signal most renderers will want
 */

/**
 * Derives the shared CelestialState for a given instant. Pure: the same
 * `now` always produces the same result.
 *
 * Takes only `now` — no `environment` parameter. Every field here (time,
 * day progress, a stylized sun position, ambient daylight) is a function of
 * the clock alone; none of it depends on weather. Accepting `environment`
 * "for consistency" with deriveLighting()/deriveClouds()/etc. would be
 * unused weight with no real future use, which is exactly the speculative
 * complexity this refactor is meant to avoid.
 *
 * @param {Date} [now] - defaults to the current instant; overridable for tests
 * @returns {CelestialState}
 */
export function deriveCelestial(now = new Date()) {
  const localHour = getTekapoDecimalHour(now)
  const dayProgress = localHour / 24
  const sunElevation = Math.sin((2 * Math.PI * (localHour - 6)) / 24)
  const daylightAmount = smoothstep(-0.15, 0.15, sunElevation)

  return { date: now, localHour, dayProgress, sunElevation, daylightAmount }
}
