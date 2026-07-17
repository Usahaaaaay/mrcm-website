import { MapPin, Navigation } from 'lucide-react'
import { getLocationCategory } from '../../lib/locationCategories'
import { formatDistance } from '../../lib/geo'

const DestinationCard = ({ destination, active, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(destination.id)}
    className={`flex w-full gap-3 rounded-2xl border p-3 text-left transition-all duration-300 ${
      active
        ? 'border-lake/30 bg-lake-50 shadow-soft'
        : 'border-navy/8 bg-snow hover:-translate-y-0.5 hover:border-lake/20 hover:shadow-soft'
    }`}
  >
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cloud">
      {destination.image_url ? (
        <img src={destination.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate/40">
          <MapPin size={20} strokeWidth={1.5} />
        </div>
      )}
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap gap-1">
        {destination.categories.map((value) => {
          const category = getLocationCategory(value)
          const Icon = category.icon
          return (
            <span
              key={value}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-snow"
              style={{ backgroundColor: category.color }}
            >
              <Icon size={10} strokeWidth={2} />
              {category.label}
            </span>
          )
        })}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-navy">{destination.name}</p>
      {destination.description ? (
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate">{destination.description}</p>
      ) : null}
      {destination.address ? (
        <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate/70">
          <MapPin size={10} />
          {destination.address}
        </p>
      ) : null}
      {formatDistance(destination.distanceKm) ? (
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate/70">
          <Navigation size={10} />
          {formatDistance(destination.distanceKm)} away
        </p>
      ) : null}
    </div>
  </button>
)

export default DestinationCard
