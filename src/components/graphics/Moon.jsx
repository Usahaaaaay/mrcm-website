import { memo } from 'react'

/**
 * @typedef {import('../../lib/environment/deriveMoon.js').MoonState} MoonState
 */

const RADIUS = 34
const HALO_RADIUS = 95

/**
 * Traces the lit portion of the moon disc as an SVG path, centered on
 * (0,0) — positioning happens via the wrapping <g>'s transform, same
 * pattern as Rain/Snow/MilkyWay. Standard two-arc "moon phase" technique:
 * one arc is a fixed semicircle (whichever half is the "outer" edge of the
 * lit region), the other is the terminator — an arc whose radius shrinks
 * from `RADIUS` (at new/full, where the terminator sits at the disc's own
 * edge) to 0 (at the quarters, where it's a straight line) and whose
 * curvature direction flips between crescent and gibbous. A pure function
 * of `phase` alone — no environment/weather read here, so this stays a
 * rendering transform of already-derived state, not a new calculation of
 * the kind deriveMoon.js is required to own.
 *
 * @param {number} phase - 0-1
 * @returns {string} SVG path `d` attribute
 */
function moonPhasePathD(phase) {
  const angle = phase * 2 * Math.PI
  const terminatorRx = Math.abs(RADIUS * Math.cos(angle))
  const outerSweep = phase < 0.5 ? 1 : 0
  // Empirically verified against all 8 named phases (see PR notes): the
  // terminator arc's sweep needs to track the outer arc's sweep in the
  // gibbous sub-ranges but *oppose* it in the crescent sub-ranges — a
  // relationship that isn't obvious from the arc geometry alone and was
  // determined by rendering and inspecting each phase, not derived on paper.
  const isGibbous = Math.cos(angle) < 0
  const terminatorSweep = isGibbous ? outerSweep : 1 - outerSweep

  return [
    `M 0 ${-RADIUS}`,
    `A ${RADIUS} ${RADIUS} 0 0 ${outerSweep} 0 ${RADIUS}`,
    `A ${terminatorRx} ${RADIUS} 0 0 ${terminatorSweep} 0 ${-RADIUS}`,
    'Z',
  ].join(' ')
}

/**
 * The Hero's moon — a procedurally phase-shaded disc with a restrained
 * halo, positioned by MoonState.x/y (already computed, see deriveMoon.js —
 * this component does no position/phase/visibility math of its own, only
 * the final opacity multiplication, same pattern MilkyWay.jsx established).
 *
 * @param {{ moon: MoonState }} props
 */
const Moon = ({ moon }) => {
  if (!moon.visible) return null

  const environmentalFade = moon.positionFade * moon.cloudFade * moon.weatherFade * moon.daylightFade
  const discOpacity = moon.opacity * environmentalFade
  const haloOpacity = moon.glow * environmentalFade

  return (
    <g
      aria-hidden="true"
      className="hero-moon"
      style={{ transform: `translate(${moon.x}px, ${moon.y}px) scale(${moon.size})` }}
    >
      {/* halo — restrained, not an exaggerated bloom */}
      <circle r={HALO_RADIUS} fill="url(#moonHalo)" className="hero-moon-shape" style={{ opacity: haloOpacity }} />
      {/* faint full-disc — a hint of the unlit portion (real moons show a
          trace of earthshine even during crescent phases), kept subtle */}
      <circle r={RADIUS} fill="url(#moonSurface)" className="hero-moon-shape" opacity={0.05 * discOpacity} />
      {/* the illuminated portion — procedural phase shading, no sprites */}
      <path
        d={moonPhasePathD(moon.phase)}
        fill="url(#moonSurface)"
        className="hero-moon-shape"
        style={{ opacity: discOpacity }}
      />
    </g>
  )
}

function areMoonPropsEqual(prevProps, nextProps) {
  const a = prevProps.moon
  const b = nextProps.moon
  return (
    a.visible === b.visible &&
    a.x === b.x &&
    a.y === b.y &&
    a.phase === b.phase &&
    a.opacity === b.opacity &&
    a.glow === b.glow &&
    a.size === b.size &&
    a.positionFade === b.positionFade &&
    a.cloudFade === b.cloudFade &&
    a.weatherFade === b.weatherFade &&
    a.daylightFade === b.daylightFade
  )
}

// Skips re-rendering across consecutive minute-ticks where nothing here
// actually changed (e.g. a long clear stretch with the moon below the
// horizon) — same reasoning as Stars.jsx/MilkyWay.jsx's memo comparators.
export default memo(Moon, areMoonPropsEqual)
