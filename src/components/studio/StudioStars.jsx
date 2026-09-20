// Extremely restrained decorative star field for the Studio Home hero only.
// Fixed, hand-placed positions (not random) so they stay put across renders;
// biased toward the hero's edges/corners so they never sit behind the
// centered heading text. Reuses the `animate-twinkle` keyframe already
// defined in index.css (previously unused) rather than adding a new one.
// Purely decorative: aria-hidden, no pointer events, and — since it's a
// plain CSS animation — already covered by index.css's global
// `prefers-reduced-motion` rule (freezes to a static frame, no extra code
// needed here).
const stars = [
  { top: '10%', left: '6%', size: 2, delay: 0 },
  { top: '20%', left: '12%', size: 1.5, delay: 1.1 },
  { top: '34%', left: '5%', size: 1.5, delay: 2.2 },
  { top: '9%', left: '91%', size: 2, delay: 0.6 },
  { top: '22%', left: '85%', size: 1.5, delay: 1.7 },
  { top: '38%', left: '93%', size: 1, delay: 2.6 },
  { top: '7%', left: '48%', size: 1, delay: 1.4 },
  { top: '14%', left: '96%', size: 1, delay: 0.3 },
]

const StudioStars = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    {stars.map((star, i) => (
      <span
        key={i}
        className="absolute animate-twinkle rounded-full bg-lantern-paper"
        style={{ top: star.top, left: star.left, width: star.size, height: star.size, animationDelay: `${star.delay}s` }}
      />
    ))}
  </div>
)

export default StudioStars
