import { formatDistanceToNow } from 'date-fns'
import { PlusCircle, PencilLine, Trash2, History } from 'lucide-react'
import Card from '../../components/ui/Card'
import Skeleton from './Skeleton'

const actionMeta = {
  created: { icon: PlusCircle, className: 'bg-lake-50 text-lake' },
  updated: { icon: PencilLine, className: 'bg-gold/15 text-gold' },
  deleted: { icon: Trash2, className: 'bg-red-50 text-red-600' },
}

const entityLabels = {
  blog_posts: 'Blog Post',
  portfolio_projects: 'Portfolio Project',
  gallery: 'Gallery Item',
  media: 'Media',
  video_links: 'Video Link',
  categories: 'Category',
}

const ActivityFeed = ({ items, loading }) => {
  if (loading) {
    return (
      <Card className="flex flex-col gap-2.5 p-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Card>
    )
  }

  if (!items || items.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 px-6 py-8 text-center">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-lake-50 text-lake">
          <History size={16} strokeWidth={1.75} />
        </span>
        <h3 className="text-sm font-semibold text-navy">No recent activity</h3>
        <p className="max-w-xs text-xs leading-relaxed text-slate">
          Start by creating your first blog post, uploading images, or adding a portfolio project.
        </p>
      </Card>
    )
  }

  return (
    <Card className="divide-y divide-navy/6 p-1.5">
      {items.map((item) => {
        const meta = actionMeta[item.action] ?? actionMeta.created
        const Icon = meta.icon
        const entityLabel = entityLabels[item.entity_type] ?? item.entity_type
        return (
          <div key={item.id} className="flex items-center gap-3 px-3.5 py-2.5">
            <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.className}`}>
              <Icon size={14} strokeWidth={1.75} />
            </span>
            <p className="flex-1 truncate text-sm text-navy">
              <span className="capitalize">{item.action}</span> {entityLabel}
              {item.entity_title ? <span className="text-slate"> — {item.entity_title}</span> : null}
            </p>
            <span className="shrink-0 text-xs text-slate/60">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </span>
          </div>
        )
      })}
    </Card>
  )
}

export default ActivityFeed
