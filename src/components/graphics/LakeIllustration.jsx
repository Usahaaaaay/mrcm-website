import { DEFAULT_ENVIRONMENT } from '../../lib/environment/defaultEnvironment'
import { deriveLighting } from '../../lib/environment/deriveLighting'
import { deriveClouds } from '../../lib/environment/deriveClouds'
import { deriveRain } from '../../lib/environment/deriveRain'
import Rain from './Rain'
import { deriveSnow } from '../../lib/environment/deriveSnow'
import Snow from './Snow'
import { deriveSky } from '../../lib/environment/deriveSky'
import { deriveStars } from '../../lib/environment/deriveStars'
import Stars from './Stars'
import { deriveMilkyWay, MILKY_WAY_PALETTE } from '../../lib/environment/deriveMilkyWay'
import MilkyWay from './MilkyWay'
import { deriveMoon } from '../../lib/environment/deriveMoon'
import Moon from './Moon'

/**
 * @typedef {import('../../types/environment.js').EnvironmentState} EnvironmentState
 * @typedef {import('../../lib/environment/deriveLighting.js').LightingConfig} LightingConfig
 * @typedef {import('../../lib/environment/deriveClouds.js').CloudConfig} CloudConfig
 * @typedef {import('../../lib/environment/deriveRain.js').RainState} RainState
 * @typedef {import('../../lib/environment/deriveSnow.js').SnowState} SnowState
 * @typedef {import('../../lib/environment/deriveSky.js').SkyState} SkyState
 * @typedef {import('../../lib/environment/deriveStars.js').StarsState} StarsState
 * @typedef {import('../../lib/environment/deriveMilkyWay.js').MilkyWayState} MilkyWayState
 * @typedef {import('../../lib/environment/deriveMoon.js').MoonState} MoonState
 */

const DEFAULT_LIGHTING = deriveLighting(DEFAULT_ENVIRONMENT)
const DEFAULT_CLOUDS = deriveClouds(DEFAULT_ENVIRONMENT)
const DEFAULT_RAIN = deriveRain(DEFAULT_ENVIRONMENT)
const DEFAULT_SNOW = deriveSnow(DEFAULT_ENVIRONMENT)
const DEFAULT_SKY = deriveSky(DEFAULT_ENVIRONMENT)
const DEFAULT_STARS = deriveStars(DEFAULT_ENVIRONMENT)
const DEFAULT_MILKY_WAY = deriveMilkyWay(DEFAULT_ENVIRONMENT)
const DEFAULT_MOON = deriveMoon(DEFAULT_ENVIRONMENT)

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
 * a RainState, and a snow layer (Phase 2B.3B, see graphics/Snow.jsx) driven
 * by a SnowState — deriveRain()/deriveSnow() guarantee at most one of the
 * two is ever enabled at once. LakeIllustration stays presentation-only for
 * both: it just places <Rain>/<Snow> in the scene; each owns its own
 * particle animation.
 *
 * Also renders the sky gradient (Phase 2C, see lib/environment/deriveSky.js)
 * driven by a SkyState — `sky.stops` is pre-computed, so this component does
 * no color math itself, just maps it onto the existing 4-stop <linearGradient>.
 *
 * Also renders the star field (see lib/environment/deriveStars.js) driven by
 * a StarsState — replaces the fixed 46-star array this file originally had
 * (Phase 1 artwork, always-on regardless of time/weather); <Stars> sits in
 * the same position in the tree and owns its own ~1,100-star layout, which
 * is generated once at module load, not here or per render.
 *
 * Also renders the Milky Way (see lib/environment/deriveMilkyWay.js) driven
 * by a MilkyWayState — layered Sky → MilkyWay → Stars → Clouds, so clouds
 * naturally paint over it and it never sits on top of (or dominates) the
 * star field.
 *
 * Also renders the moon (see lib/environment/deriveMoon.js) driven by a
 * MoonState — replaces the fixed moon circles this file originally had
 * (same static-Phase-1-artwork situation the old star array was in);
 * <Moon> moves, phase-shades, and fades on its own, computed entirely in
 * deriveMoon.js. Layered Stars → Moon → Clouds, so clouds paint over it too.
 *
 * @param {{ environment?: EnvironmentState, lighting?: LightingConfig, clouds?: CloudConfig, rain?: RainState, snow?: SnowState, sky?: SkyState, stars?: StarsState, milkyWay?: MilkyWayState, moon?: MoonState }} props
 */
const LakeIllustration = ({
  environment = DEFAULT_ENVIRONMENT,
  lighting = DEFAULT_LIGHTING,
  clouds = DEFAULT_CLOUDS,
  rain = DEFAULT_RAIN,
  snow = DEFAULT_SNOW,
  sky = DEFAULT_SKY,
  stars = DEFAULT_STARS,
  milkyWay = DEFAULT_MILKY_WAY,
  moon = DEFAULT_MOON,
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
        {sky.stops.map((stop) => (
          <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} className="hero-sky-stop" />
        ))}
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

      {/* Restrained halo — softer/lower-opacity falloff than the old fixed
          moonGlow it replaces, per this phase's "avoid exaggerated bloom". */}
      <radialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#F7F3E8" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#F7F3E8" stopOpacity="0" />
      </radialGradient>

      {/* The lit-disc fill — an off-center focal point gives a subtle
          brightness gradient across the disc ("naturally illuminated",
          not a perfectly flat/white circle) without literal crater detail. */}
      <radialGradient id="moonSurface" cx="42%" cy="40%" r="65%">
        <stop offset="0%" stopColor="#FBF8EF" />
        <stop offset="70%" stopColor="#EDE7D6" />
        <stop offset="100%" stopColor="#D8D0BC" />
      </radialGradient>

      <radialGradient id="cloudPuff" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#F3F6F8" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#F3F6F8" stopOpacity="0" />
      </radialGradient>

      {/* One soft radial glow per Milky Way palette entry (see
          deriveMilkyWay.js's MILKY_WAY_PALETTE) — same technique as
          moonGlow/cloudPuff above, just parameterized over the palette so
          there's one definition per color instead of four near-duplicates. */}
      {MILKY_WAY_PALETTE.map((color, i) => (
        <radialGradient key={color} id={`milkyWayGlow${i}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      ))}
    </defs>

    {/* sky */}
    <rect x="0" y="0" width="1440" height="800" fill="url(#sky)" />

    {/* Milky Way — visibility driven by `milkyWay` (MilkyWayState); layered
        behind stars and clouds deliberately (Sky → Milky Way → Stars →
        Clouds), so it never sits on top of the star field and clouds
        naturally paint over it. Shape is fixed (no animation); only opacity
        changes as conditions change. */}
    <MilkyWay milkyWay={milkyWay} />

    {/* stars — visibility driven by `stars` (StarsState); positions are a
        fixed, deterministic layout generated once (see deriveStars.js),
        never regenerated here */}
    <Stars stars={stars} />

    {/* moon — position/phase/visibility driven entirely by `moon`
        (MoonState); renders nothing when moon.visible is false. Layered
        here deliberately (sky/Milky Way/stars → moon → clouds), so clouds
        naturally paint over it. */}
    <Moon moon={moon} />

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

    {/* snow — visibility/intensity driven by `snow`; renders nothing when
        snow.enabled is false. Layered here deliberately (sky/clouds → snow →
        mountains), not after the landscape like rain — falling flakes are
        meant to disappear behind the mountain silhouette below, painted next. */}
    <Snow snow={snow} />

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
