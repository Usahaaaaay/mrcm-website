import { TrendingUp } from 'lucide-react'
import Card from '../../components/ui/Card'
import Skeleton from './Skeleton'

const StatCard = ({ icon: Icon, label, value, delta, loading }) => (
  <Card
    hover
    className="relative flex flex-col gap-0.5 p-4"
  >
    <span className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-lake-50 text-lake">
      <Icon size={13} strokeWidth={1.75} />
    </span>

    {loading ? (
      <Skeleton className="h-8 w-14" />
    ) : (
      <span className="text-3xl font-bold leading-none text-navy">{value}</span>
    )}

    <span className="mt-2 text-xs font-medium text-slate">{label}</span>

    {!loading && delta > 0 ? (
      <span className="mt-1.5 inline-flex w-fit items-center gap-1 text-[11px] font-medium text-lake">
        <TrendingUp size={11} strokeWidth={2} />+{delta} this month
      </span>
    ) : null}
  </Card>
)

export default StatCard
