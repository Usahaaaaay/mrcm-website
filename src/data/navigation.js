// `type: 'hash'` entries are sections on the homepage (always addressed as
// `/#id` so they resolve correctly no matter which page you're navigating from).
// `type: 'route'` entries are their own pages.
//
// `hidden: true` keeps an entry's route/page/component fully intact and
// reachable by direct URL — it only removes it from the rendered nav
// (Navbar, Footer, and anywhere else that reads `visibleNavLinks`). Use this
// for pages still under development: re-enabling one is a one-line change.
// Blog intentionally has no entry here — it's reached from a link in the
// About profile card (src/components/sections/About.jsx) instead of primary
// navigation, so the site leads with "meet Mae" before "read the blog". The
// page/route/admin management are all untouched; this only affects what's
// rendered as a nav item (see visibleNavLinks below).
export const navLinks = [
  { label: 'Home', href: '/#home', type: 'hash' },
  { label: 'Portfolio', href: '/#portfolio', type: 'hash' },
  { label: 'Gallery', href: '/#gallery', type: 'hash' },
  { label: 'Tekapo Guide', href: '/guide', type: 'route' },
  { label: 'Tekapo Journey', href: '/tekapo-journey', type: 'route', hidden: true },
  // Little Lantern Studios is its own separate identity (own layout, own
  // navigation, own footer — see src/layouts/StudioLayout.jsx) that just
  // happens to live at /studio on this same site. This is the one, single
  // entry point into it from the main site; nothing inside /studio links
  // back out to here, by design.
  { label: 'Little Lantern', href: '/studio', type: 'route' },
  { label: 'About', href: '/#about', type: 'hash' },
]

// The single list every rendered menu should map over — filtering lives here
// once, rather than each consumer re-implementing the same `.filter()`.
export const visibleNavLinks = navLinks.filter((link) => !link.hidden)
