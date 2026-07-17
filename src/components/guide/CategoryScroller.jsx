import { LOCATION_CATEGORIES } from '../../lib/locationCategories'

/** Flat (ungrouped) single-row version of GuideFilters' chips for mobile quick
 *  access — a single row has no room for group headings, unlike the full
 *  grouped view reused inside FilterDrawer. Same selected/onToggle contract
 *  as GuideFilters, so toggling a chip here and in FilterDrawer stay in sync
 *  through the same shared state in TekapoGuidePage. */
const CategoryScroller = ({ selected, onToggle }) => (
  <div
    className="flex gap-2 overflow-x-auto rounded-full bg-snow/95 p-1.5 shadow-lift backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    role="group"
    aria-label="Filter by category"
  >
    {LOCATION_CATEGORIES.map((category) => {
      const Icon = category.icon
      const isActive = selected.includes(category.value)
      return (
        <button
          key={category.value}
          type="button"
          onClick={() => onToggle(category.value)}
          aria-pressed={isActive}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
            isActive
              ? 'border-transparent text-snow shadow-soft'
              : 'border-navy/12 bg-snow text-slate hover:border-lake/30 hover:text-navy'
          }`}
          style={isActive ? { backgroundColor: category.color } : undefined}
        >
          <Icon size={13} strokeWidth={2} />
          {category.label}
        </button>
      )
    })}
  </div>
)

export default CategoryScroller
