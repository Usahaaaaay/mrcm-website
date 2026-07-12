const particles = [
  { left: '12%', top: '30%', size: 5, duration: 9, delay: 0 },
  { left: '24%', top: '55%', size: 3, duration: 11, delay: 1.2 },
  { left: '38%', top: '20%', size: 4, duration: 8, delay: 2.1 },
  { left: '52%', top: '62%', size: 3, duration: 10, delay: 0.6 },
  { left: '67%', top: '35%', size: 5, duration: 12, delay: 1.8 },
  { left: '78%', top: '58%', size: 3, duration: 9, delay: 2.6 },
  { left: '88%', top: '25%', size: 4, duration: 10, delay: 0.9 },
  { left: '46%', top: '15%', size: 3, duration: 11, delay: 1.5 },
]

const FloatingParticles = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    {particles.map((p, i) => (
      <span
        key={i}
        className="absolute rounded-full bg-alpine/70 animate-float"
        style={{
          left: p.left,
          top: p.top,
          width: p.size,
          height: p.size,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
        }}
      />
    ))}
  </div>
)

export default FloatingParticles
