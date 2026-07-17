import { SlidersHorizontal } from 'lucide-react'
import GuideSearch from './GuideSearch'

/** Floats over the map on mobile — wraps the existing GuideSearch (unchanged)
 *  and hosts the "open FilterDrawer" trigger in the same pill. */
const FloatingSearch = ({ value, onChange, onOpenFilters, activeFilterCount }) => (
  <div className="flex items-center gap-1.5 rounded-full bg-snow/95 p-1.5 shadow-lift backdrop-blur">
    <div className="min-w-0 flex-1">
      <GuideSearch value={value} onChange={onChange} />
    </div>
    <button
      type="button"
      onClick={onOpenFilters}
      aria-label={activeFilterCount > 0 ? `Filters (${activeFilterCount} active)` : 'Filters'}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-navy hover:text-lake"
    >
      <SlidersHorizontal size={18} />
      {activeFilterCount > 0 ? (
        <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-lake text-[10px] font-bold text-snow">
          {activeFilterCount}
        </span>
      ) : null}
    </button>
  </div>
)

export default FloatingSearch
