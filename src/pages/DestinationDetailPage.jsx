import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Compass } from 'lucide-react'
import { getVisibleDestination } from '../services/destinationService'
import { getLocationCategory } from '../lib/locationCategories'

const DestinationDetailPage = () => {
  const { id } = useParams()
  const [destination, setDestination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getVisibleDestination(id)
      .then((data) => !cancelled && setDestination(data))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="min-h-screen bg-alpine px-6 pb-24 pt-28 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <Link to="/guide" className="inline-flex items-center gap-1.5 text-sm font-medium text-lake hover:underline">
          <ArrowLeft size={14} /> Back to Tekapo Guide
        </Link>

        {loading ? (
          <p className="mt-8 text-sm text-slate">Loading…</p>
        ) : error || !destination ? (
          <div className="mt-8 rounded-3xl border border-navy/8 bg-snow p-10 text-center shadow-soft">
            <p className="text-sm text-slate">This destination couldn&rsquo;t be found.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-navy/8 bg-snow shadow-soft">
            {destination.image_url ? (
              <img src={destination.image_url} alt="" loading="lazy" className="aspect-video w-full object-cover" />
            ) : null}
            <div className="flex flex-col gap-4 p-8">
              <div className="flex flex-wrap gap-1.5">
                {destination.categories.map((value) => {
                  const category = getLocationCategory(value)
                  const Icon = category.icon
                  return (
                    <span
                      key={value}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-snow"
                      style={{ backgroundColor: category.color }}
                    >
                      <Icon size={12} strokeWidth={2} />
                      {category.label}
                    </span>
                  )
                })}
              </div>

              <h1 className="font-display text-2xl font-bold text-navy sm:text-3xl">{destination.name}</h1>

              {destination.description ? (
                <p className="text-base leading-relaxed text-slate">{destination.description}</p>
              ) : null}

              {destination.experiences.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <h2 className="text-sm font-semibold text-navy">Available Experiences</h2>
                  <ul className="flex flex-col gap-1.5">
                    {destination.experiences.map((experience) => {
                      const category = experience.category ? getLocationCategory(experience.category) : null
                      const Icon = category?.icon ?? Compass
                      return (
                        <li key={experience.id} className="flex items-center gap-2 text-sm text-slate">
                          <Icon size={14} className="shrink-0 text-lake" strokeWidth={2} />
                          {experience.name}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}

              {destination.address ? (
                <p className="flex items-center gap-1.5 text-sm text-slate">
                  <MapPin size={14} /> {destination.address}
                </p>
              ) : null}

              <p className="mt-2 text-xs text-slate/50">
                More details — opening hours, website, and booking links — are coming in a future update.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DestinationDetailPage
