// The Little Lantern Studios visual signature — a small hand-drawn lantern,
// not an illustration. Same treatment as components/icons/BrandIcons.jsx:
// plain inline SVG, single color via currentColor, no gradients or filters
// baked in (glow, if any, is applied by the caller — see the Home hero vs.
// footer usage, which intentionally differ). Replaces the earlier OwlMark
// experiment as the Home hero's mark (Phase 9.3) — kept deliberately simple
// (handle, roof, chamber, one flame, one base, two tiny sparkles) so it
// still reads clearly at 40px.
const LanternMark = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Handle */}
    <path d="M10 3.8Q12 1.2 14 3.8" />
    {/* Roof */}
    <path d="M6.5 7 12 3.5 17.5 7Z" />
    {/* Glass chamber */}
    <rect x="6.5" y="7" width="11" height="10" rx="2.3" />
    {/* Base */}
    <rect x="8" y="17.3" width="8" height="1.8" rx="0.6" />
    {/* Flame */}
    <path
      d="M12 9.6c1.1 1.3 1.7 2.4 1.7 3.3a1.7 1.7 0 1 1-3.4 0c0-.9.6-2 1.7-3.3Z"
      fill="currentColor"
      stroke="none"
    />
    {/* Tiny sparkles */}
    <path d="M3.6 8 3.6 9.6M2.8 8.8 4.4 8.8" />
    <path d="M20.4 9.5 20.4 10.7M19.8 10.1 21 10.1" />
  </svg>
)

export default LanternMark
