import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Compass } from 'lucide-react'
import { getLocationCategory } from '../../lib/locationCategories'

/** `destination` carries every category and named experience it offers (see
 *  src/services/destinationService.js) — one destination is always one marker. */
const DestinationPopup = ({ destination }) => (
  <div className="w-60 font-body">
    {destination.image_url ? (
      <img src={destination.image_url} alt="" loading="lazy" className="mb-2 h-24 w-full rounded-lg object-cover" />
    ) : null}

    <p className="text-sm font-semibold leading-snug text-navy">{destination.name}</p>

    <div className="mt-1.5 flex flex-wrap gap-1">
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

    {destination.experiences.length > 0 ? (
      <div className="mt-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate/60">Available Experiences</p>
        <ul className="mt-1 flex flex-col gap-1">
          {destination.experiences.map((experience) => {
            const category = experience.category ? getLocationCategory(experience.category) : null
            const Icon = category?.icon ?? Compass
            return (
              <li key={experience.id} className="flex items-center gap-1.5 text-xs text-slate">
                <Icon size={11} className="shrink-0 text-lake" strokeWidth={2} />
                {experience.name}
              </li>
            )
          })}
        </ul>
      </div>
    ) : null}

    {destination.description ? (
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate">{destination.description}</p>
    ) : null}

    {destination.address ? (
      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate/70">
        <MapPin size={10} />
        {destination.address}
      </p>
    ) : null}

    <Link
      to={`/guide/${destination.id}`}
      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-lake hover:underline"
    >
      View Details <ArrowRight size={11} />
    </Link>
  </div>
)

export default DestinationPopup
