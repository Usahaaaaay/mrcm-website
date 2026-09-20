import { memo } from 'react'

/**
 * @typedef {import('../../lib/environment/deriveMilkyWay.js').MilkyWayState} MilkyWayState
 */

// Rotates/scales around the sky's rough center, not the SVG's (0,0) origin.
const ROTATE_ORIGIN = '720px 300px'

/**
 * The Hero's Milky Way — a soft, diagonal band of overlapping blurred glows,
 * meant to be barely noticeable at first glance. Purely presentational: it
 * receives MilkyWayState and applies it, performing no time/weather/
 * visibility calculation of its own (see deriveMilkyWay.js for all of that).
 *
 * The one calculation that *does* live here — final per-blob opacity — is
 * deliberately a render-layer concern, not a derive-layer one: multiplying
 * `opacity × skyDarkness × cloudFade × weatherFade × moonlightFade ×
 * brightness × blob.relativeBrightness` here (rather than pre-composing it
 * in deriveMilkyWay.js) is what lets a future phase add one more factor
 * (atmosphericScattering) as one more term in this line, without
 * deriveMilkyWay.js's shape or this component's structure changing.
 * `moonlightFade` (added alongside deriveMoon.js) is the first proof of
 * that: this line gained one multiplier, nothing else about this file moved.
 *
 * Shape/position never change (no animation — this should read as
 * infinitely distant); only the opacity multiplication varies as conditions
 * change.
 *
 * @param {{ milkyWay: MilkyWayState }} props
 */
const MilkyWay = ({ milkyWay }) => {
  if (!milkyWay.visible) return null

  const baseFactor =
    milkyWay.opacity *
    milkyWay.skyDarkness *
    milkyWay.cloudFade *
    milkyWay.weatherFade *
    milkyWay.moonlightFade *
    milkyWay.brightness

  return (
    <g
      aria-hidden="true"
      style={{
        transform: `rotate(${milkyWay.rotation}deg)`,
        transformOrigin: ROTATE_ORIGIN,
      }}
    >
      {milkyWay.blobs.map((blob, i) => (
        <ellipse
          key={i}
          cx={blob.x}
          cy={blob.y}
          rx={blob.rx}
          ry={blob.ry}
          fill={`url(#milkyWayGlow${blob.paletteIndex})`}
          className="hero-milky-way-blob"
          style={{
            opacity: clamp01(baseFactor * blob.relativeBrightness),
            filter: `blur(${blob.blurPx}px)`,
          }}
        />
      ))}
    </g>
  )
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value))
}

function areMilkyWayPropsEqual(prevProps, nextProps) {
  const a = prevProps.milkyWay
  const b = nextProps.milkyWay
  // `blobs` is a stable module-level reference (===); everything else here
  // is a small scalar. rotation/bandWidth are fixed constants but included
  // for correctness in case a future phase makes them reactive.
  return (
    a.visible === b.visible &&
    a.opacity === b.opacity &&
    a.brightness === b.brightness &&
    a.skyDarkness === b.skyDarkness &&
    a.cloudFade === b.cloudFade &&
    a.weatherFade === b.weatherFade &&
    a.moonlightFade === b.moonlightFade &&
    a.rotation === b.rotation &&
    a.bandWidth === b.bandWidth &&
    a.blobs === b.blobs
  )
}

// Skips re-rendering 18 blobs across the many consecutive minute-ticks where
// nothing here actually changed (e.g. a long clear night, or any daylight
// stretch where `visible` stays false) — same reasoning as Stars.jsx/Snow.jsx.
export default memo(MilkyWay, areMilkyWayPropsEqual)
