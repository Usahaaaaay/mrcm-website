// `type: 'hash'` entries are sections on the homepage (always addressed as
// `/#id` so they resolve correctly no matter which page you're navigating from).
// `type: 'route'` entries are their own pages.
export const navLinks = [
  { label: 'Home', href: '/#home', type: 'hash' },
  { label: 'Blog', href: '/#blog', type: 'hash' },
  { label: 'Portfolio', href: '/#portfolio', type: 'hash' },
  { label: 'Gallery', href: '/#gallery', type: 'hash' },
  { label: 'Tekapo Guide', href: '/guide', type: 'route' },
  { label: 'About', href: '/#about', type: 'hash' },
]
