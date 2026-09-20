import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Menu, X } from 'lucide-react'
import { studioNavLinks } from '../../data/studioNavigation'
import { useScrollLock } from '../../hooks/useScrollLock'

// A link is active on an exact match, except the Home entry ('/studio'
// itself) which would otherwise also match every other /studio/* route.
const isStudioLinkActive = (href, pathname) =>
  href === '/studio' ? pathname === '/studio' : pathname === href || pathname.startsWith(`${href}/`)

const StudioNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useScrollLock(menuOpen)

  const handleLinkClick = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-lantern-paper/10 bg-lantern-dusk">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-10"
        aria-label="Little Lantern Studios"
      >
        <Link to="/studio" className="inline-flex items-center gap-2.5" onClick={handleLinkClick}>
          {/* A small, restrained lantern glow — the one recurring "lit" detail
              that shows up on the mark itself, not scattered across the page. */}
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-lantern-glow/15 text-lantern-glow shadow-[0_0_14px_rgba(244,166,74,0.35)]">
            <Flame size={17} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="font-display text-base font-bold tracking-tight text-lantern-paper">
            Little Lantern <span className="text-lantern-glow">Studios</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-9 md:flex">
          {studioNavLinks.map((link) => {
            const active = isStudioLinkActive(link.href, pathname)
            return (
              <li key={link.href}>
                <Link
                  to={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative py-1 text-sm font-medium transition-colors duration-300 ${
                    active ? 'text-lantern-glow' : 'text-lantern-paper/75 hover:text-lantern-paper'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-lantern-glow transition-all duration-300 ${
                      active ? 'w-full' : 'w-0'
                    }`}
                  />
                </Link>
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full p-3 text-lantern-paper md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-lantern-paper/10 bg-lantern-dusk md:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 pb-6 pt-2">
              {studioNavLinks.map((link) => {
                const active = isStudioLinkActive(link.href, pathname)
                return (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      onClick={handleLinkClick}
                      className={`block rounded-xl px-3 py-3 text-base font-medium transition-colors ${
                        active ? 'bg-lantern-glow/15 text-lantern-glow' : 'text-lantern-paper/80 hover:text-lantern-paper'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

export default StudioNavbar
