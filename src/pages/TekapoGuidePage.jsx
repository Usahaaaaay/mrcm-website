import { useEffect, useMemo, useState } from 'react'
import { useDestinations } from '../hooks/useDestinations'
import { useGeolocation } from '../hooks/useGeolocation'
import { useScrollLock } from '../hooks/useScrollLock'
import { haversineDistanceKm } from '../lib/geo'
import { getLocationCategory } from '../lib/locationCategories'
import GuideLayout from '../components/guide/GuideLayout'

const matchesSearch = (destination, term) => {
  if (!term) return true
  const haystack = `${destination.name} ${destination.description ?? ''} ${destination.address ?? ''} ${destination.experiences
    .map((e) => e.name)
    .join(' ')}`.toLowerCase()
  return haystack.includes(term.toLowerCase())
}

const TekapoGuidePage = () => {
  const { destinations, loading, error } = useDestinations()
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [sortMode, setSortMode] = useState('alphabetical')
  const { coords: userLocation, status: geoStatus, requestLocation } = useGeolocation()

  useScrollLock(fullscreen)

  const toggleCategory = (value) =>
    setSelectedCategories((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]))

  // Selecting "Nearest" doubles as the "Nearby" quick action — it requests
  // location if not already granted, rather than needing a separate button
  // for the same effect.
  const handleSortModeChange = (mode) => {
    setSortMode(mode)
    if (mode === 'nearest' && geoStatus !== 'granted' && geoStatus !== 'locating') {
      requestLocation()
    }
  }

  const destinationsWithDistance = useMemo(
    () =>
      userLocation
        ? destinations.map((destination) => ({
            ...destination,
            distanceKm: haversineDistanceKm(userLocation, { lat: destination.latitude, lng: destination.longitude }),
          }))
        : destinations,
    [destinations, userLocation]
  )

  const filteredDestinations = useMemo(
    () =>
      destinationsWithDistance.filter(
        (destination) =>
          (selectedCategories.length === 0 || selectedCategories.some((c) => destination.categories.includes(c))) &&
          matchesSearch(destination, search)
      ),
    [destinationsWithDistance, search, selectedCategories]
  )

  // Alphabetical is already the incoming order from listVisibleDestinations()
  // (ordered by name) — only 'nearest' and 'category' need an explicit sort.
  const sortedDestinations = useMemo(() => {
    if (sortMode === 'nearest' && userLocation) {
      return [...filteredDestinations].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    }
    if (sortMode === 'category') {
      return [...filteredDestinations].sort((a, b) => {
        const labelA = getLocationCategory(a.categories[0]).label
        const labelB = getLocationCategory(b.categories[0]).label
        return labelA.localeCompare(labelB) || a.name.localeCompare(b.name)
      })
    }
    return filteredDestinations
  }, [filteredDestinations, sortMode, userLocation])

  // Satisfies "auto-zoom if one result": reuses the existing selectedId/
  // FlyToSelected mechanism rather than a new one.
  useEffect(() => {
    if (sortedDestinations.length === 1 && sortedDestinations[0].id !== selectedId) {
      setSelectedId(sortedDestinations[0].id)
    }
  }, [sortedDestinations, selectedId])

  return (
    <GuideLayout
      loading={loading}
      error={error}
      filteredDestinations={sortedDestinations}
      search={search}
      onSearchChange={setSearch}
      selectedCategories={selectedCategories}
      onToggleCategory={toggleCategory}
      selectedId={selectedId}
      onSelectLocation={setSelectedId}
      fullscreen={fullscreen}
      onToggleFullscreen={() => setFullscreen((f) => !f)}
      userLocation={userLocation}
      geoStatus={geoStatus}
      onRequestLocation={requestLocation}
      sortMode={sortMode}
      onSortModeChange={handleSortModeChange}
    />
  )
}

export default TekapoGuidePage
