import { useEffect, useState } from 'react'

/**
 * A Date that updates every `intervalMs`, for anything that needs to react
 * to the passage of real time rather than a data event — currently just the
 * sky gradient's continuous day-cycle position (src/lib/environment/deriveSky.js).
 * Deliberately its own tiny hook rather than folded into useEnvironmentState:
 * this ticks on a real-time clock, useEnvironmentState ticks on a data-fetch
 * cadence (~12 min) — two different concerns that happen to both produce a
 * "when should Hero recompute" signal.
 *
 * @param {number} [intervalMs]
 * @returns {Date}
 */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
