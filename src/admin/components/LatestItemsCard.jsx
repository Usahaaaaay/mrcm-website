import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowUpRight } from 'lucide-react'
import Card from '../../components/ui/Card'
import Skeleton from './Skeleton'

const LatestItemsCard = ({ icon: Icon, title, items, viewAllHref, emptyLabel, loading }) => (
  <Card className="flex flex-col p-5">
    <div className="flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-navy">
        <Icon size={15} strokeWidth={1.75} className="text-lake" />
        {title}
      </h3>
      <Link to={viewAllHref} className="text-xs font-medium text-lake hover:underline">
        View all
      </Link>
    </div>

    <div className="mt-3 flex flex-col divide-y divide-navy/6">
      {loading ? (
        Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="my-1.5 h-12 w-full" />)
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate">{emptyLabel}</p>
      ) : (
        items.map((item) => (
          <Link
            key={item.id}
            to={item.viewHref}
            className="group flex items-center gap-3 py-2.5 transition-colors hover:bg-cloud/60 -mx-2 px-2 rounded-xl"
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cloud">
              {item.thumbnail ? <img src={item.thumbnail} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy">{item.title}</p>
              <div className="mt-0.5 flex items-center gap-2">
                {item.badge ? (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${item.badge.className}`}>
                    {item.badge.label}
                  </span>
                ) : null}
                <span className="text-[11px] text-slate/70">{format(new Date(item.date), 'MMM d, yyyy')}</span>
              </div>
            </div>
            <ArrowUpRight
              size={14}
              className="shrink-0 text-slate/40 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </Link>
        ))
      )}
    </div>
  </Card>
)

export default LatestItemsCard
