import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport'

/**
 * @typedef {import('../../lib/environment/deriveRain.js').RainState} RainState
 */

// Same coordinate space as LakeIllustration's viewBox — Rain is meant to be
// rendered as a child of that <svg>, not a standalone one.
const VIEWBOX_WIDTH = 1440
const VIEWBOX_HEIGHT = 800
const STREAK_LENGTH = 18 // viewBox units — a short motion-blur streak, not a giant cartoon drop
const RAIN_COLOR = '#DCEAF0'

const MAX_PARTICLES_DESKTOP = 220
const MAX_PARTICLES_MOBILE = 90
// Even light drizzle should read as "it's raining" rather than 1-2 near-invisible streaks.
const MIN_ACTIVE_WHEN_ENABLED = 12
const BASE_FALL_SPEED = 850 // viewBox units/second at intensity 1

const randomBetween = (min, max) => min + Math.random() * (max - min)

function createParticle() {
  return {
    x: randomBetween(-60, VIEWBOX_WIDTH + 60),
    // Spread initial y across (and above) the full height so the layer
    // reads as continuous rain immediately, not a synchronized first wave.
    y: randomBetween(-VIEWBOX_HEIGHT, VIEWBOX_HEIGHT),
    speedFactor: randomBetween(0.75, 1.25), // per-particle speed variance
  }
}

function buildPool(size) {
  return Array.from({ length: size }, createParticle)
}

/**
 * The Hero's rain layer — thin, soft vertical streaks that fall and recycle.
 * Renders as a child of LakeIllustration's <svg> (see its usage there), so
 * it automatically inherits the same CSS brightness/saturation filter and
 * lighting-wash tint everything else in the scene does — rain doesn't need
 * to know about `lighting` at all to "fit" the current scene brightness.
 *
 * Receives only RainState. No weather calculation happens here — `enabled`/
 * `intensity` are the only inputs, both already decided by deriveRain().
 *
 * Particle positions are driven by a requestAnimationFrame loop that
 * mutates each <line>'s `transform` attribute directly via refs — never
 * React state — so falling rain never triggers a React re-render. The only
 * things that go through React's render cycle are mount/unmount (mirroring
 * `rain.enabled`) and how many of the fixed pool are currently "active"
 * (mirroring `rain.intensity`), each already throttled to real EnvironmentState
 * changes (~every 12 minutes), not per frame.
 *
 * @param {{ rain: RainState }} props
 */
const Rain = ({ rain }) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobile = useIsMobileViewport()

  const maxParticles = isMobile ? MAX_PARTICLES_MOBILE : MAX_PARTICLES_DESKTOP
  const activeCount = rain.enabled
    ? Math.min(maxParticles, Math.max(MIN_ACTIVE_WHEN_ENABLED, Math.round(maxParticles * rain.intensity)))
    : 0

  // Lazily (re)built only when the pool size itself changes (e.g. crossing
  // the mobile breakpoint) — never recreated per frame or per intensity
  // tick, satisfying "reuse geometry, recycle particles instead of
  // recreating them." Runs synchronously during render so the pool exists
  // in time for the JSX below on the very first paint.
  const poolRef = useRef({ size: -1, particles: [] })
  if (poolRef.current.size !== maxParticles) {
    poolRef.current = { size: maxParticles, particles: buildPool(maxParticles) }
  }
  const particles = poolRef.current.particles

  // Read fresh inside the animation loop without forcing it to tear down
  // and restart every time intensity nudges — only `rain.enabled`,
  // reduced-motion, and pool identity do that (see the effect below).
  const activeCountRef = useRef(activeCount)
  const intensityRef = useRef(rain.intensity)
  useEffect(() => {
    activeCountRef.current = activeCount
    intensityRef.current = rain.intensity
  }, [activeCount, rain.intensity])

  const groupRef = useRef(null)

  useEffect(() => {
    if (!rain.enabled || prefersReducedMotion) return undefined

    const group = groupRef.current
    if (!group) return undefined

    let frameId
    let lastTime = null

    const tick = (time) => {
      if (lastTime == null) lastTime = time
      const deltaSeconds = Math.min(0.05, (time - lastTime) / 1000)
      lastTime = time

      const speedThisFrame = BASE_FALL_SPEED * (0.6 + intensityRef.current * 0.6)
      const active = activeCountRef.current
      const children = group.children

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]
        particle.y += speedThisFrame * particle.speedFactor * deltaSeconds

        if (particle.y > VIEWBOX_HEIGHT + STREAK_LENGTH) {
          particle.y = -STREAK_LENGTH - Math.random() * VIEWBOX_HEIGHT * 0.5
          particle.x = randomBetween(-60, VIEWBOX_WIDTH + 60)
        }

        // Only the currently-active subset needs a DOM write — the rest
        // keep falling in JS so they're already in motion whenever a rising
        // intensity reveals them, but skip the (comparatively) costlier
        // attribute write while invisible.
        if (i < active) {
          const el = children[i]
          if (el) el.setAttribute('transform', `translate(${particle.x.toFixed(1)}, ${particle.y.toFixed(1)})`)
        }
      }

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intensity/activeCount are read via refs on purpose, see above
  }, [rain.enabled, prefersReducedMotion, particles])

  if (!rain.enabled) return null

  return (
    <g ref={groupRef} aria-hidden="true">
      {particles.map((particle, i) => (
        <line
          key={i}
          x1="0"
          y1="0"
          x2="0"
          y2={STREAK_LENGTH}
          stroke={RAIN_COLOR}
          strokeWidth="1.4"
          strokeLinecap="round"
          className="hero-rain-drop"
          transform={`translate(${particle.x.toFixed(1)}, ${particle.y.toFixed(1)})`}
          style={{ opacity: i < activeCount ? 0.28 + rain.intensity * 0.22 : 0 }}
        />
      ))}
    </g>
  )
}

export default Rain
