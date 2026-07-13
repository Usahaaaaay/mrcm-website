import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { navLinks } from '../../data/navigation'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useScrollLock } from '../../hooks/useScrollLock'

const sectionIds = navLinks.filter((link) => link.type === 'hash').map((link) => link.href.replace('/#', ''))

const isLinkActive = (link, pathname) => {
  if (link.type === 'route') {
    return pathname === link.href || pathname.startsWith(`${link.href}/`)
  }
  return false
}

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const activeSectionId = useActiveSection(sectionIds)
  const barRef = useRef(null)

  useScrollLock(menuOpen)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Publishes the header's real rendered height as a CSS custom property so
  // any page can reserve exactly that much space below the fixed header
  // instead of a hand-guessed padding value (see TekapoGuidePage.jsx).
  // Measures `barRef` (the persistent logo/nav row) rather than the whole
  // <header> — the mobile dropdown menu is a sibling inside <header> too, and
  // its height must NOT be counted here or every page's layout would jump
  // whenever the hamburger menu opens. useLayoutEffect (not useEffect) so the
  // very first paint already has the correct value, no flash of wrong size.
  useLayoutEffect(() => {
    const el = barRef.current
    if (!el) return

    const setHeaderHeightVar = () => {
      document.documentElement.style.setProperty('--site-header-height', `${el.offsetHeight}px`)
    }

    setHeaderHeightVar()
    const observer = new ResizeObserver(setHeaderHeightVar)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleLinkClick = () => setMenuOpen(false)
  const lightChrome = scrolled || menuOpen || pathname !== '/'

  const isActive = (link) =>
    link.type === 'hash' ? pathname === '/' && activeSectionId === link.href.replace('/#', '') : isLinkActive(link, pathname)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        lightChrome
          ? 'bg-alpine/80 backdrop-blur-md border-b border-navy/8 shadow-[0_1px_0_rgba(16,42,67,0.04)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav
        ref={barRef}
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10"
        aria-label="Primary"
      >
        <Link
          to="/"
          className={`font-display text-lg font-bold tracking-tight transition-colors duration-500 ${
            lightChrome ? 'text-navy' : 'text-alpine'
          }`}
        >
          MRC<span className={lightChrome ? 'text-lake' : 'text-turquoise'}>Malubay</span>
        </Link>

        <ul className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link)
            return (
              <li key={link.href}>
                <Link
                  to={link.href}
                  aria-current={active ? 'true' : undefined}
                  className={`relative py-1 text-sm font-medium transition-colors duration-300 ${
                    active
                      ? lightChrome
                        ? 'text-lake'
                        : 'text-turquoise'
                      : lightChrome
                        ? 'text-slate hover:text-navy'
                        : 'text-alpine/80 hover:text-alpine'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px transition-all duration-300 ${
                      lightChrome ? 'bg-lake' : 'bg-turquoise'
                    } ${active ? 'w-full' : 'w-0'}`}
                  />
                </Link>
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          className={`inline-flex items-center justify-center rounded-full p-2 transition-colors duration-500 md:hidden ${
            lightChrome ? 'text-navy' : 'text-alpine'
          }`}
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
            className="overflow-hidden bg-alpine/95 backdrop-blur-md border-b border-navy/8 md:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 pb-6 pt-2">
              {navLinks.map((link) => {
                const active = isActive(link)
                return (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      onClick={handleLinkClick}
                      className={`block rounded-xl px-3 py-3 text-base font-medium transition-colors ${
                        active ? 'bg-lake-50 text-lake' : 'text-slate hover:text-navy'
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

export default Navbar
