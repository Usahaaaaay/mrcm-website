import { getGroupedLocationCategories } from '../../lib/locationCategories'

const groupedCategories = getGroupedLocationCategories()

const GuideFilters = ({ selected, onToggle }) => (
  <div className="flex flex-col gap-3">
    {groupedCategories.map(({ group, categories }) => (
      <div key={group}>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate/60">{group}</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label={`Filter by ${group}`}>
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = selected.includes(category.value)
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => onToggle(category.value)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'border-transparent text-snow shadow-soft'
                    : 'border-navy/12 bg-snow text-slate hover:border-lake/30 hover:text-navy'
                }`}
                style={isActive ? { backgroundColor: category.color } : undefined}
              >
                <Icon size={12} strokeWidth={2} />
                {category.label}
              </button>
            )
          })}
        </div>
      </div>
    ))}
  </div>
)

export default GuideFilters
