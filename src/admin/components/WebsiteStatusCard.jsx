import Card from '../../components/ui/Card'
import Skeleton from './Skeleton'
import { formatFileSize } from '../lib/validation'

const Row = ({ label, value, loading }) => (
  <div className="flex items-center justify-between py-2 text-sm">
    <span className="text-slate">{label}</span>
    {loading ? <Skeleton className="h-4 w-8" /> : <span className="font-medium text-navy">{value}</span>}
  </div>
)

const WebsiteStatusCard = ({ stats, loading }) => (
  <Card className="flex flex-col p-5">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-navy">Website Status</h3>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-lake">
        <span className="h-1.5 w-1.5 rounded-full bg-lake" />
        Online
      </span>
    </div>

    <div className="mt-2 divide-y divide-navy/6">
      <Row label="Blog Posts" value={stats?.blogPosts} loading={loading} />
      <Row label="Portfolio Projects" value={stats?.portfolioProjects} loading={loading} />
      <Row label="Gallery Images" value={stats?.galleryItems} loading={loading} />
      <Row label="Videos" value={stats?.videos} loading={loading} />
      <Row label="Categories" value={stats?.categories} loading={loading} />
      <Row
        label="Storage Used"
        value={stats ? formatFileSize(stats.storageUsedBytes) : null}
        loading={loading}
      />
      <Row label="Last Backup" value="Automatic (Supabase)" loading={loading} />
    </div>
  </Card>
)

export default WebsiteStatusCard
