// Little Lantern Studios' own primary navigation — deliberately separate from
// src/data/navigation.js (MRCMalubay's nav) so the two brands never share a
// menu or bleed into each other. Every entry is a route under /studio;
// StudioNavbar and StudioFooter both read from this single list.
export const studioNavLinks = [
  { label: 'Home', href: '/studio' },
  { label: 'Apps', href: '/studio/apps' },
  { label: 'Projects', href: '/studio/projects' },
  { label: 'About', href: '/studio/about' },
]
