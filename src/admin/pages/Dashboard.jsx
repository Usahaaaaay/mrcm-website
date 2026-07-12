import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Newspaper,
  FolderGit2,
  GalleryHorizontal,
  Tag,
  Image,
  Video,
  Plus,
  Upload,
  FilePlus2,
} from 'lucide-react'
import { useDashboardData } from '../hooks/useDashboardData'
import { useAuth } from '../hooks/useAuth'
import StatCard from '../components/StatCard'
import ActivityFeed from '../components/ActivityFeed'
import WebsiteStatusCard from '../components/WebsiteStatusCard'
import LatestItemsCard from '../components/LatestItemsCard'
import Button from '../../components/ui/Button'

const quickActions = [
  { label: 'New Blog', href: '/admin/blog/new', icon: FilePlus2, primary: true },
  { label: 'New Project', href: '/admin/portfolio/new', icon: Plus },
  { label: 'Upload Image', href: '/admin/media?action=upload-image', icon: Upload },
  { label: 'Upload Video', href: '/admin/videos?action=upload-video', icon: Upload },
  { label: 'Add Category', href: '/admin/categories?action=new', icon: Tag },
]

const blogStatusStyles = {
  published: 'bg-lake-50 text-lake',
  draft: 'bg-cloud text-slate',
}

const portfolioStatusStyles = {
  Live: 'bg-lake-50 text-lake',
  'In Progress': 'bg-gold/15 text-gold',
  Planned: 'bg-cloud text-slate',
}

const Dashboard = () => {
  const { stats, activity, latest, loading, updatedAt } = useDashboardData()
  const { user } = useAuth()

  const displayName = user?.email
    ? user.email.split('@')[0].replace(/^\w/, (c) => c.toUpperCase())
    : 'there'

  const statCards = [
    { icon: Newspaper, label: 'Blog Posts', value: stats?.blogPosts, delta: stats?.deltas.blogPosts },
    { icon: FolderGit2, label: 'Portfolio Projects', value: stats?.portfolioProjects, delta: stats?.deltas.portfolioProjects },
    { icon: GalleryHorizontal, label: 'Gallery Items', value: stats?.galleryItems, delta: stats?.deltas.galleryItems },
    { icon: Tag, label: 'Categories', value: stats?.categories, delta: stats?.deltas.categories },
    { icon: Image, label: 'Images', value: stats?.images, delta: stats?.deltas.images },
    { icon: Video, label: 'Videos', value: stats?.videos, delta: stats?.deltas.videos },
  ]

  const latestPosts = latest.posts.map((p) => ({
    id: p.id,
    title: p.title,
    thumbnail: p.cover_media?.url ?? null,
    badge: { label: p.status, className: blogStatusStyles[p.status] },
    date: p.updated_at,
    viewHref: `/admin/blog/${p.id}/edit`,
  }))

  const latestProjects = latest.projects.map((p) => ({
    id: p.id,
    title: p.title,
    thumbnail: p.cover_media?.url ?? null,
    badge: { label: p.status, className: portfolioStatusStyles[p.status] },
    date: p.updated_at,
    viewHref: `/admin/portfolio/${p.id}/edit`,
  }))

  const latestGallery = latest.gallery.map((g) => ({
    id: g.id,
    title: g.title,
    thumbnail: g.media?.url ?? null,
    badge: g.category ? { label: g.category.name, className: 'bg-cloud text-slate' } : null,
    date: g.created_at,
    viewHref: '/admin/gallery',
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
          <p className="mt-1.5 text-sm text-navy">
            Welcome back, {displayName} <span aria-hidden="true">👋</span>
          </p>
          <p className="text-sm text-slate">Here&rsquo;s what&rsquo;s happening on your website today.</p>
          {updatedAt ? (
            <p className="mt-2 text-xs text-slate/60">Last updated {format(updatedAt, "MMM d, yyyy 'at' h:mm a")}</p>
          ) : null}
        </div>
        <Button as={Link} to="/admin/blog/new" icon={Plus}>
          New Blog
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map(({ label, href, icon, primary }) => (
            <Button
              key={label}
              as={Link}
              to={href}
              variant={primary ? 'primary' : 'secondary'}
              icon={icon}
              className="hover:-translate-y-0.5"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate">Recent Activity</h2>
          <ActivityFeed items={activity} loading={loading} />
        </div>
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate">Status</h2>
          <WebsiteStatusCard stats={stats} loading={loading} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate">Latest Content</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <LatestItemsCard
            icon={Newspaper}
            title="Latest Blog Posts"
            items={latestPosts}
            viewAllHref="/admin/blog"
            emptyLabel="No blog posts yet."
            loading={loading}
          />
          <LatestItemsCard
            icon={FolderGit2}
            title="Latest Portfolio Projects"
            items={latestProjects}
            viewAllHref="/admin/portfolio"
            emptyLabel="No projects yet."
            loading={loading}
          />
          <LatestItemsCard
            icon={GalleryHorizontal}
            title="Latest Gallery Uploads"
            items={latestGallery}
            viewAllHref="/admin/gallery"
            emptyLabel="No gallery items yet."
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
