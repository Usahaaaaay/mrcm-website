import { memo, useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport'

/**
 * @typedef {import('../../lib/environment/deriveSnow.js').SnowState} SnowState
 */

// Same coordinate space as LakeIllustration's viewBox — Snow is meant to be
// rendered as a child of that <svg>, not a standalone one.
const VIEWBOX_WIDTH = 1440
// Flakes recycle well above the true canvas bottom (800): once a flake's y
// passes this line it's already behind the mountain silhouette (painted
// after Snow — see LakeIllustration's layering) and invisible, so there's
// no point animating/writing it any further down. This also means "falling
// behind the mountains" is a natural, unforced consequence of paint order,
// not special-cased here.
const RECYCLE_Y = 480
const SNOW_COLOR = '#FFFFFF'

const MAX_PARTICLES_DESKTOP = 150 // matches deriveSnow's own "heavy" ceiling
const MAX_PARTICLES_MOBILE = 65
const BASE_FALL_SPEED = 95 // viewBox units/second at speed=1 — deliberately slow, unlike Rain

// --- deterministic PRNG -----------------------------------------------
// Rain.jsx uses Math.random() since it has no determinism requirement; Snow
// explicitly does (see deriveSnow.js's SNOW_SEED comment), so this is a
// self-contained mulberry32 generator rather than shared with Rain.
function createSeededRandom(seed) {
  let state = seed >>> 0
  return function next() {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomBetween(rng, min, max) {
  return min + rng() * (max - min)
}

function createFlake(rng) {
  return {
    x: randomBetween(rng, -40, VIEWBOX_WIDTH + 40),
    baseX: 0, // set below, once x is known
    y: randomBetween(rng, -400, RECYCLE_Y),
    radius: randomBetween(rng, 1, 2.5),
    speedFactor: randomBetween(rng, 0.7, 1.3),
    driftAmplitude: randomBetween(rng, 6, 14),
    driftFrequency: randomBetween(rng, 0.4, 1.1), // radians/sec
    driftPhase: randomBetween(rng, 0, Math.PI * 2),
    opacityFactor: randomBetween(rng, 0.55, 1), // per-flake variety, on top of SnowState.opacity
  }
}

function buildPool(size, seed) {
  const rng = createSeededRandom(seed)
  const flakes = Array.from({ length: size }, () => createFlake(rng))
  for (const flake of flakes) flake.baseX = flake.x
  return { rng, flakes }
}

/**
 * The Hero's snow layer — soft, slow, circular flakes that drift sideways
 * while falling. Same architecture as Rain.jsx (see that file's doc comment
 * for the full rationale): renders as a child of LakeIllustration's <svg>
 * so it inherits the same brightness/saturation filter and lighting-wash
 * tint for free, receives only SnowState, and drives per-frame motion via
 * requestAnimationFrame + direct `transform` attribute writes on a pooled,
 * never-recreated set of <circle> elements — never React state, so falling
 * snow never triggers a React re-render.
 *
 * Two deliberate differences from Rain, both because snow behaves
 * differently, not because the architecture changed:
 *  - Flake generation is a seeded, deterministic PRNG (SnowState.seed),
 *    not Math.random() — see deriveSnow.js.
 *  - Each flake sways horizontally (a per-flake sine wave) as well as
 *    falling, instead of moving in a straight line.
 *
 * @param {{ snow: SnowState }} props
 */
const Snow = ({ snow }) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobile = useIsMobileViewport()

  const maxParticles = isMobile ? MAX_PARTICLES_MOBILE : MAX_PARTICLES_DESKTOP
  const activeCount = snow.enabled ? Math.min(maxParticles, snow.particleCount) : 0

  // Lazily (re)built only when pool size or seed changes — in practice the
  // seed is a fixed constant (see deriveSnow.js), so this only ever rebuilds
  // when crossing the mobile breakpoint. Runs synchronously during render so
  // the pool exists in time for the JSX below on the very first paint.
  const poolRef = useRef({ size: -1, seed: -1, flakes: [], rng: null })
  if (poolRef.current.size !== maxParticles || poolRef.current.seed !== snow.seed) {
    const { rng, flakes } = buildPool(maxParticles, snow.seed)
    poolRef.current = { size: maxParticles, seed: snow.seed, flakes, rng }
  }
  const flakes = poolRef.current.flakes

  // Read fresh inside the animation loop without forcing it to tear down
  // and restart on every intensity/drift/speed nudge — only `snow.enabled`,
  // reduced-motion, and pool identity do that (see the effect below).
  const liveRef = useRef({ activeCount, drift: snow.drift, speed: snow.speed })
  useEffect(() => {
    liveRef.current = { activeCount, drift: snow.drift, speed: snow.speed }
  }, [activeCount, snow.drift, snow.speed])

  const groupRef = useRef(null)
  const elapsedRef = useRef(0)

  useEffect(() => {
    if (!snow.enabled || prefersReducedMotion) return undefined

    const group = groupRef.current
    if (!group) return undefined

    let frameId
    let lastTime = null

    const tick = (time) => {
      if (lastTime == null) lastTime = time
      const deltaSeconds = Math.min(0.05, (time - lastTime) / 1000)
      lastTime = time
      elapsedRef.current += deltaSeconds

      const { activeCount: active, drift, speed } = liveRef.current
      const children = group.children
      const rng = poolRef.current.rng

      for (let i = 0; i < flakes.length; i++) {
        const flake = flakes[i]
        flake.y += BASE_FALL_SPEED * speed * flake.speedFactor * deltaSeconds

        if (flake.y > RECYCLE_Y) {
          flake.y = randomBetween(rng, -420, -20)
          flake.baseX = randomBetween(rng, -40, VIEWBOX_WIDTH + 40)
        }

        // Gentle sideways sway, per-flake frequency/phase so the whole
        // layer doesn't sway in unison — "avoid perfectly straight vertical
        // motion" without any physics simulation.
        const sway = Math.sin(elapsedRef.current * flake.driftFrequency + flake.driftPhase) * flake.driftAmplitude
        flake.x = flake.baseX + sway * (drift / 15) // drift (px) scales the base sway amplitude

        // Only the currently-active subset needs a DOM write — the rest
        // keep falling/swaying in JS so they're already in motion whenever
        // a rising intensity reveals them.
        if (i < active) {
          const el = children[i]
          if (el) el.setAttribute('transform', `translate(${flake.x.toFixed(1)}, ${flake.y.toFixed(1)})`)
        }
      }

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- drift/speed/activeCount read via refs on purpose, see above
  }, [snow.enabled, prefersReducedMotion, flakes])

  if (!snow.enabled) return null

  return (
    <g ref={groupRef} aria-hidden="true">
      {flakes.map((flake, i) => (
        <circle
          key={i}
          cx="0"
          cy="0"
          r={flake.radius}
          fill={SNOW_COLOR}
          className="hero-snow-flake"
          transform={`translate(${flake.x.toFixed(1)}, ${flake.y.toFixed(1)})`}
          style={{ opacity: i < activeCount ? snow.opacity * flake.opacityFactor : 0 }}
        />
      ))}
    </g>
  )
}

function areSnowPropsEqual(prevProps, nextProps) {
  const a = prevProps.snow
  const b = nextProps.snow
  return (
    a.enabled === b.enabled &&
    a.intensity === b.intensity &&
    a.particleCount === b.particleCount &&
    a.opacity === b.opacity &&
    a.drift === b.drift &&
    a.speed === b.speed &&
    a.seed === b.seed
  )
}

// Live weather refreshes (~every 12 min) produce a brand-new SnowState
// object even when nothing actually changed (e.g. steady snowfall for
// hours) — this comparator skips the re-render in that common case instead
// of relying on reference equality, which a fresh object would always fail.
export default memo(Snow, areSnowPropsEqual)
