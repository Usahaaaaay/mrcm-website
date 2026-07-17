import { useState } from 'react'
import { AlertTriangle, Compass } from 'lucide-react'
import GuideSearch from './GuideSearch'
import GuideFilters from './GuideFilters'
import FloatingSearch from './FloatingSearch'
import CategoryScroller from './CategoryScroller'
import FilterDrawer from './FilterDrawer'
import BottomDrawer from './BottomDrawer'
import DestinationCard from './DestinationCard'
import GuideMap from './GuideMap'

const SORT_OPTIONS = [
  { value: 'alphabetical', label: 'A–Z' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'category', label: 'Category' },
]

const SortControl = ({ sortMode, onSortModeChange }) => (
  <div className="flex items-center gap-1 rounded-full bg-cloud p-1" role="group" aria-label="Sort destinations">
    {SORT_OPTIONS.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onSortModeChange(option.value)}
        aria-pressed={sortMode === option.value}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          sortMode === option.value ? 'bg-snow text-navy shadow-soft' : 'text-slate hover:text-navy'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
)

/**
 * Owns all responsive composition (mobile floating-overlay "app mode" vs
 * tablet/desktop side-by-side sidebar) and the fullscreen show/hide behavior.
 *
 * Golden rule for fullscreen: the div directly wrapping <GuideMap> is a
 * single, unconditionally-rendered element at a fixed position in this tree —
 * only its className toggles between the normal in-flow size and a fixed
 * full-viewport overlay. Every other section (title bar, aside, mobile
 * overlay per the confirmed "keep search+chips visible in fullscreen"
 * decision, BottomDrawer, FilterDrawer) is a conditionally-rendered SIBLING.
 * This never changes GuideMap's position/identity in the tree, so React never
 * unmounts it — Leaflet's instance survives every fullscreen toggle, and the
 * existing MapResizeHandler (inside GuideMap.jsx, untouched) picks up the
 * container's size change automatically.
 */
const GuideLayout = ({
  loading,
  error,
  filteredDestinations,
  search,
  onSearchChange,
  selectedCategories,
  onToggleCategory,
  selectedId,
  onSelectLocation,
  fullscreen,
  onToggleFullscreen,
  userLocation,
  geoStatus,
  onRequestLocation,
  sortMode,
  onSortModeChange,
}) => {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const listContent = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate/60">
          {filteredDestinations.length} {filteredDestinations.length === 1 ? 'place' : 'places'}
        </p>
        <SortControl sortMode={sortMode} onSortModeChange={onSortModeChange} />
      </div>

      {sortMode === 'nearest' && (geoStatus === 'denied' || geoStatus === 'unsupported') ? (
        <p className="text-[11px] text-slate/60">Location unavailable — showing default order instead.</p>
      ) : null}

      {!loading && error ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-slate">
          <AlertTriangle size={22} strokeWidth={1.5} />
          <p className="text-sm">Couldn&rsquo;t load destinations right now — please try again shortly.</p>
        </div>
      ) : !loading && filteredDestinations.length === 0 ? (
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
            onSelect={onSelectLocation}
          />
        ))
      )}
    </>
  )

  return (
    <div
      className={fullscreen ? 'fixed inset-0 z-[60] flex flex-col overflow-hidden bg-alpine' : 'flex flex-col overflow-hidden bg-alpine'}
      style={
        fullscreen
          ? undefined
          : { marginTop: 'var(--site-header-height, 5rem)', height: 'calc(100vh - var(--site-header-height, 5rem))' }
      }
    >
      {!fullscreen ? (
        <div className="border-b border-navy/8 px-6 py-5 sm:px-10">
          <h1 className="font-display text-xl font-bold text-navy sm:text-2xl">Tekapo Guide</h1>
          <p className="mt-1 text-sm text-slate">
            Find toilets, parking, walking tracks, and the best stargazing spots around Lake Tekapo.
          </p>
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        {!fullscreen ? (
          <aside className="hidden min-h-0 flex-col border-navy/8 md:flex md:w-[300px] md:shrink-0 md:border-r lg:w-[420px]">
            <div className="flex flex-col gap-4 border-b border-navy/8 p-5">
              <GuideSearch value={search} onChange={onSearchChange} />
              <GuideFilters selected={selectedCategories} onToggle={onToggleCategory} />
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-5">{listContent}</div>
          </aside>
        ) : null}

        <div className="pointer-events-none absolute inset-x-4 top-4 z-40 flex flex-col gap-2 md:hidden">
          <div className="pointer-events-auto">
            <FloatingSearch
              value={search}
              onChange={onSearchChange}
              onOpenFilters={() => setFilterDrawerOpen(true)}
              activeFilterCount={selectedCategories.length}
            />
          </div>
          <div className="pointer-events-auto">
            <CategoryScroller selected={selectedCategories} onToggle={onToggleCategory} />
          </div>
        </div>

        <div className={fullscreen ? 'h-full w-full' : 'relative h-[65vh] shrink-0 md:h-auto md:flex-1'}>
          <GuideMap
            destinations={filteredDestinations}
            selectedId={selectedId}
            onSelectLocation={onSelectLocation}
            userLocation={userLocation}
            geoStatus={geoStatus}
            onRequestLocation={onRequestLocation}
            fullscreen={fullscreen}
            onToggleFullscreen={onToggleFullscreen}
          />
        </div>

        {!fullscreen ? (
          <BottomDrawer resultCount={filteredDestinations.length} className="md:hidden">
            {listContent}
          </BottomDrawer>
        ) : null}
      </div>

      {!fullscreen ? (
        <FilterDrawer
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          selected={selectedCategories}
          onToggle={onToggleCategory}
        />
      ) : null}
    </div>
  )
}

export default GuideLayout
