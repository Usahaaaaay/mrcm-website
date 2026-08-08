import { memo } from 'react'

/**
 * @typedef {import('../../lib/environment/deriveStars.js').StarsState} StarsState
 */

// Below this, every star's rendered opacity rounds to imperceptible — skip
// the DOM entirely rather than mounting ~1,100 invisible circles (mirrors
// Rain.jsx/Snow.jsx's "render nothing when disabled" pattern). The
// underlying star *data* is unaffected either way — see deriveStars.js's
// module-level STAR_FIELD; only DOM presence is gated here.
const VISIBILITY_RENDER_THRESHOLD = 0.003

/**
 * The Hero's star field — hundreds of small, static circles whose only
 * changing property is opacity. No motion, no twinkle, no color (all later
 * phases) — this renderer's entire job is applying one visibility number to
 * a fixed, pre-generated layout.
 *
 * Receives the whole StarsState as the `stars` prop (matching the `rain`/
 * `snow`/`clouds` naming convention elsewhere in LakeIllustration — so
 * `props.stars.stars` is the star array; destructured immediately below to
 * keep the body readable).
 *
 * @param {{ stars: StarsState }} props
 */
const Stars = ({ stars }) => {
  const { visibility, stars: starList } = stars

  if (visibility < VISIBILITY_RENDER_THRESHOLD) return null

  return (
    <g aria-hidden="true">
      {starList.map((star, i) => (
        <circle
          key={i}
          cx={star.x}
          cy={star.y}
          r={star.radius}
          fill="#FAFAF8"
          className="hero-star"
          style={{ opacity: visibility * star.brightness * star.opacityMultiplier }}
        />
      ))}
    </g>
  )
}

function areStarsPropsEqual(prevProps, nextProps) {
  // `stars.stars` (the layout array) is a stable module-level reference — a
  // plain === is correct and cheap. `visibility` is the only value that
  // actually varies call to call.
  return (
    prevProps.stars.visibility === nextProps.stars.visibility && prevProps.stars.stars === nextProps.stars.stars
  )
}

// Skips re-rendering ~1,100 <circle> elements across the many consecutive
// minute-ticks where visibility hasn't meaningfully changed (e.g. the many
// hours of flat daylight) — same reasoning as Snow.jsx's memo comparator.
export default memo(Stars, areStarsPropsEqual)
