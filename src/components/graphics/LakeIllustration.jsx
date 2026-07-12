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

/**
 * A minimal, non-literal landscape inspired by Lake Tekapo: dark sky fading to
 * an alpine dawn, layered mountains, a still lake, and a scattering of pines.
 */
const LakeIllustration = () => (
  <svg
    viewBox="0 0 1440 800"
    preserveAspectRatio="xMidYMax slice"
    className="absolute inset-0 h-full w-full"
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
  </svg>
)

export default LakeIllustration
