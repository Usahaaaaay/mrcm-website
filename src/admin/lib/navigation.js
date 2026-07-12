import {
  LayoutDashboard,
  Tag,
  Image,
  Newspaper,
  FolderGit2,
  GalleryHorizontal,
  Video,
  MapPin,
  UserCircle,
} from 'lucide-react'

export const adminNavGroups = [
  {
    label: 'Main',
    items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Content',
    items: [
      { label: 'About Me', href: '/admin/about', icon: UserCircle },
      { label: 'Blog', href: '/admin/blog', icon: Newspaper },
      { label: 'Portfolio', href: '/admin/portfolio', icon: FolderGit2 },
    ],
  },
  {
    label: 'Media',
    items: [
      { label: 'Gallery', href: '/admin/gallery', icon: GalleryHorizontal },
      { label: 'Videos', href: '/admin/videos', icon: Video },
      { label: 'Media Library', href: '/admin/media', icon: Image },
    ],
  },
  {
    label: 'Organization',
    items: [{ label: 'Categories', href: '/admin/categories', icon: Tag }],
  },
  {
    label: 'Tekapo Guide',
    items: [{ label: 'Destinations', href: '/admin/destinations', icon: MapPin }],
  },
]

export const adminNavItems = adminNavGroups.flatMap((group) => group.items)
