import { DEFAULT_ENVIRONMENT } from '../../lib/environment/defaultEnvironment'
import { deriveLighting } from '../../lib/environment/deriveLighting'
import { deriveClouds } from '../../lib/environment/deriveClouds'
import { deriveRain } from '../../lib/environment/deriveRain'
import Rain from './Rain'

/**
 * @typedef {import('../../types/environment.js').EnvironmentState} EnvironmentState
 * @typedef {import('../../lib/environment/deriveLighting.js').LightingConfig} LightingConfig
 * @typedef {import('../../lib/environment/deriveClouds.js').CloudConfig} CloudConfig
 * @typedef {import('../../lib/environment/deriveRain.js').RainState} RainState
 */

const DEFAULT_LIGHTING = deriveLighting(DEFAULT_ENVIRONMENT)
const DEFAULT_CLOUDS = deriveClouds(DEFAULT_ENVIRONMENT)
const DEFAULT_RAIN = deriveRain(DEFAULT_ENVIRONMENT)

const Star = ({ cx, cy, r, delay }) => (
  <circle
    cx={cx}
    cy={cy}
    r={r}
    fill="#FAFAF8"
    className="animate-twinkle"
    style={{ animationDelay: `${delay}s` }}
  />
)

const stars = Array.from({ length: 46 }, (_, i) => ({
  cx: (i * 137 + 40) % 1440,
  cy: ((i * 71) % 260) + 20,
  r: [0.6, 0.9, 1.3, 1.6][i % 4],
  delay: (i % 10) * 0.4,
}))

// Hand-placed positions/sizes for the cloud layer — a rendering/artwork
// concern owned here, same as `stars` above. How visible each slot is
// comes entirely from CloudConfig.puffs[i] (src/lib/environment/deriveClouds.js);
// this component does no cloud-density math of its own. Order matches
// CLOUD_SLOT_COUNT in deriveClouds.js.
const CLOUD_SLOTS = [
  { cx: 180, cy: 150, rx: 90, ry: 34 },
  { cx: 420, cy: 90, rx: 110, ry: 40 },
  { cx: 680, cy: 190, rx: 80, ry: 30 },
  { cx: 900, cy: 110, rx: 120, ry: 42 },
  { cx: 1080, cy: 220, rx: 95, ry: 34 },
  { cx: 300, cy: 240, rx: 100, ry: 36 },
  { cx: 560, cy: 60, rx: 85, ry: 30 },
  { cx: 1260, cy: 265, rx: 105, ry: 38 },
]

/** A single soft, flat-illustration cloud puff — three overlapping ellipses
 *  sharing the `cloudPuff` gradient, in the same "soft blob" technique the
 *  moon glow already uses. Visibility/size/softness are the only things
 *  that change; the shape itself is fixed, like every other artwork element. */
const Cloud = ({ slot, opacity, scale, softnessPx }) => (
  <g
    className="hero-cloud"
    style={{
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: `${slot.cx}px ${slot.cy}px`,
      filter: `blur(${softnessPx}px)`,
    }}
  >
    <ellipse cx={slot.cx} cy={slot.cy} rx={slot.rx} ry={slot.ry} fill="url(#cloudPuff)" />
    <ellipse
      cx={slot.cx - slot.rx * 0.55}
      cy={slot.cy + slot.ry * 0.15}
      rx={slot.rx * 0.6}
      ry={slot.ry * 0.7}
      fill="url(#cloudPuff)"
      opacity="0.85"
    />
    <ellipse
      cx={slot.cx + slot.rx * 0.6}
      cy={slot.cy + slot.ry * 0.1}
      rx={slot.rx * 0.65}
      ry={slot.ry * 0.75}
      fill="url(#cloudPuff)"
      opacity="0.85"
    />
  </g>
)

/**
 * A minimal, non-literal landscape inspired by Lake Tekapo: dark sky fading to
 * an alpine dawn, layered mountains, a still lake, and a scattering of pines.
 *
 * Accepts the scene's EnvironmentState — still unused directly (Phase 2B.1
 * only reads it indirectly, via the derived `lighting` prop; weather/effects
 * branching is still future-phase work) — and a LightingConfig (Phase 2B.1)
 * applied as a CSS brightness/saturation filter plus a single translucent
 * color-grade wash on top of the fixed artwork below. The artwork itself
 * (shapes, gradients, moon, stars) is never repainted — only lit differently
 * — so composition stays identical to Phase 1 across every time of day.
 *
 * Also renders a cloud layer (Phase 2B.2) driven by a CloudConfig — puffs
 * built from the same fixed shapes/positions regardless of density; only
 * their opacity/scale/softness change, so composition never shifts.
 *
 * Also renders a rain layer (Phase 2B.3A, see graphics/Rain.jsx) driven by
 * a RainState. LakeIllustration stays presentation-only here too — it just
 * places <Rain> in the scene; Rain owns its own particle animation.
 *
 * @param {{ environment?: EnvironmentState, lighting?: LightingConfig, clouds?: CloudConfig, rain?: RainState }} props
 */
const LakeIllustration = ({
  environment = DEFAULT_ENVIRONMENT,
  lighting = DEFAULT_LIGHTING,
  clouds = DEFAULT_CLOUDS,
  rain = DEFAULT_RAIN,
}) => (
  <svg
    viewBox="0 0 1440 800"
    preserveAspectRatio="xMidYMax slice"
    className="hero-lighting absolute inset-0 h-full w-full"
    style={{ filter: `brightness(${lighting.exposure}) saturate(${lighting.saturation})` }}
    role="img"
    aria-label="Illustration of mountains and a still lake beneath a starlit sky, inspired by Lake Tekapo"
  >
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#102A43" />
        <stop offset="42%" stopColor="#1C4A66" />
        <stop offset="72%" stopColor="#2D6E92" />
        <stop offset="100%" stopColor="#FAFAF8" />
      </linearGradient>

      <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#69B7C8" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#FAFAF8" stopOpacity="0.9" />
      </linearGradient>

      <linearGradient id="mtnBack" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4E5B61" />
        <stop offset="100%" stopColor="#2D6E92" />
      </linearGradient>

      <linearGradient id="mtnFront" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#102A43" />
        <stop offset="100%" stopColor="#1C4A66" />
      </linearGradient>

      <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FAFAF8" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#FAFAF8" stopOpacity="0" />
      </radialGradient>

      <radialGradient id="cloudPuff" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#F3F6F8" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#F3F6F8" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* sky */}
    <rect x="0" y="0" width="1440" height="800" fill="url(#sky)" />

    {/* stars */}
    <g>
      {stars.map((s, i) => (
        <Star key={i} {...s} />
      ))}
    </g>

    {/* moon */}
    <circle cx="1180" cy="120" r="90" fill="url(#moonGlow)" />
    <circle cx="1180" cy="120" r="34" fill="#FAFAF8" opacity="0.9" />

    {/* clouds — visibility/size/softness driven by `clouds` (CloudConfig);
        positions/shapes are fixed, same artwork regardless of density */}
    <g aria-hidden="true">
      {CLOUD_SLOTS.map((slot, i) => (
        <Cloud
          key={i}
          slot={slot}
          opacity={(clouds.puffs[i]?.opacity ?? 0) * clouds.opacity}
          scale={clouds.scale}
          softnessPx={clouds.softnessPx}
        />
      ))}
    </g>

    {/* back mountain range */}
    <path
      d="M0,430 L140,330 L260,400 L380,300 L520,410 L660,320 L820,420 L980,340 L1140,430 L1300,350 L1440,420 L1440,560 L0,560 Z"
      fill="url(#mtnBack)"
      opacity="0.55"
    />
    {/* snow caps, back range */}
    <path
      d="M120,345 L140,330 L160,347 L150,350 L140,340 L130,349 Z M500,420 L520,410 L540,423 M640,330 L660,320 L680,332"
      fill="#FAFAF8"
      opacity="0.5"
    />

    {/* front mountain range */}
    <path
      d="M0,520 L180,400 L320,490 L460,380 L620,500 L780,410 L940,510 L1100,400 L1260,500 L1440,440 L1440,600 L0,600 Z"
      fill="url(#mtnFront)"
    />
    <path
      d="M150,415 L180,400 L205,417 L190,420 L180,410 L165,420 Z M600,415 L620,500 M440,395 L460,380 L482,397 L468,400 L460,390 L448,399 Z"
      fill="#FAFAF8"
      opacity="0.35"
    />

    {/* lake */}
    <rect x="0" y="600" width="1440" height="200" fill="url(#lake)" />
    {/* reflection ripples */}
    <g stroke="#2D6E92" strokeOpacity="0.18" strokeWidth="2">
      <line x1="120" y1="640" x2="360" y2="640" />
      <line x1="500" y1="670" x2="820" y2="670" />
      <line x1="900" y1="645" x2="1180" y2="645" />
      <line x1="200" y1="705" x2="560" y2="705" />
      <line x1="700" y1="730" x2="1040" y2="730" />
      <line x1="1100" y1="700" x2="1360" y2="700" />
    </g>

    {/* minimal pine trees, foreground */}
    <g fill="#102A43">
      <path d="M80,600 L100,555 L120,600 Z" />
      <path d="M100,600 L120,545 L140,600 Z" />
      <path d="M1320,600 L1338,562 L1356,600 Z" />
      <path d="M1300,600 L1318,548 L1336,600 Z" />
      <path d="M1350,600 L1364,568 L1378,600 Z" />
    </g>

    {/* rain — visibility/intensity driven by `rain`; renders nothing when
        rain.enabled is false. Placed before the lighting wash so it's
        naturally tinted/dimmed by the same overlay as the rest of the scene. */}
    <Rain rain={rain} />

    {/* lighting wash — a single translucent overlay for the whole scene,
        driven by `lighting`; everything above is the fixed Phase 1 artwork */}
    <rect
      x="0"
      y="0"
      width="1440"
      height="800"
      fill={lighting.tintColor}
      opacity={lighting.tintOpacity}
      className="hero-lighting-tint"
      aria-hidden="true"
    />
  </svg>
)

export default LakeIllustration
