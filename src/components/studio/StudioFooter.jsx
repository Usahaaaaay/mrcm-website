import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { studioNavLinks } from '../../data/studioNavigation'
import LanternMark from './LanternMark'

const StudioFooter = () => (
  <footer className="border-t border-lantern-paper/10 bg-lantern-dusk text-lantern-paper/70">
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-14 sm:px-10">
      <Link to="/studio" className="inline-flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-lantern-glow/15 text-lantern-glow shadow-[0_0_14px_rgba(244,166,74,0.35)]">
          <Flame size={15} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="font-display text-base font-bold tracking-tight text-lantern-paper">
          Little Lantern <span className="text-lantern-glow">Studios</span>
        </span>
      </Link>

      <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 text-sm">
        {studioNavLinks.map((link) => (
          <li key={link.href}>
            <Link to={link.href} className="inline-block py-2 transition-colors hover:text-lantern-glow">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="h-px w-full max-w-xs bg-lantern-paper/10" />

      {/* A quiet studio signature — the lantern mark, used once, small, and muted. */}
      <LanternMark size={18} className="text-lantern-paper/30" />

      <p className="text-center font-display text-sm italic text-lantern-paper/60">
        &ldquo;A little light for whatever gets made next.&rdquo;
      </p>

      <p className="text-xs text-lantern-paper/50">© 2026 Little Lantern Studios. A personal creative studio.</p>
    </div>
  </footer>
)

export default StudioFooter
