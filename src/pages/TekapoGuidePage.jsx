import { useMemo, useState } from 'react'
import { Compass } from 'lucide-react'
import { useDestinations } from '../hooks/useDestinations'
import GuideMap from '../components/guide/GuideMap'
import GuideSearch from '../components/guide/GuideSearch'
import GuideFilters from '../components/guide/GuideFilters'
import DestinationCard from '../components/guide/DestinationCard'

const matchesSearch = (destination, term) => {
  if (!term) return true
  const haystack = `${destination.name} ${destination.description ?? ''} ${destination.address ?? ''} ${destination.experiences
    .map((e) => e.name)
    .join(' ')}`.toLowerCase()
  return haystack.includes(term.toLowerCase())
}

const TekapoGuidePage = () => {
  const { destinations, loading } = useDestinations()
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedId, setSelectedId] = useState(null)

  const toggleCategory = (value) =>
    setSelectedCategories((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]))

  const filteredDestinations = useMemo(
    () =>
      destinations.filter(
        (destination) =>
          (selectedCategories.length === 0 || selectedCategories.some((c) => destination.categories.includes(c))) &&
          matchesSearch(destination, search)
      ),
    [destinations, search, selectedCategories]
  )

  const listContent =
    !loading && filteredDestinations.length === 0 ? (
      <div className="flex flex-col items-center gap-2 py-10 text-center text-slate">
        <Compass size={22} strokeWidth={1.5} />
        <p className="text-sm">No destinations match your search.</p>
      </div>
    ) : (
      filteredDestinations.map((destination) => (
        <DestinationCard
          key={destination.id}
          destination={destination}
          active={destination.id === selectedId}
          onSelect={setSelectedId}
        />
      ))
    )

  return (
    <div className="flex h-screen flex-col bg-alpine pt-20 sm:pt-24">
      <div className="border-b border-navy/8 px-6 py-5 sm:px-10">
        <h1 className="font-display text-xl font-bold text-navy sm:text-2xl">Tekapo Guide</h1>
        <p className="mt-1 text-sm text-slate">
          Find toilets, parking, walking tracks, and the best stargazing spots around Lake Tekapo.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="hidden min-h-0 flex-col lg:flex lg:w-[420px] lg:shrink-0 lg:border-r lg:border-navy/8">
          <div className="flex flex-col gap-4 border-b border-navy/8 p-5">
            <GuideSearch value={search} onChange={setSearch} />
            <GuideFilters selected={selectedCategories} onToggle={toggleCategory} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-5">{listContent}</div>
        </aside>

        <div className="flex flex-col gap-4 border-b border-navy/8 p-5 lg:hidden">
          <GuideSearch value={search} onChange={setSearch} />
          <GuideFilters selected={selectedCategories} onToggle={toggleCategory} />
        </div>

        <div className="h-[45vh] shrink-0 lg:h-auto lg:flex-1">
          <GuideMap destinations={filteredDestinations} selectedId={selectedId} onSelectLocation={setSelectedId} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-5 lg:hidden">{listContent}</div>
      </div>
    </div>
  )
}

export default TekapoGuidePage
