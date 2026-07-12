import { CATEGORY_ICON_OPTIONS, CategoryIcon } from '../../../lib/categoryIcons'

const IconPicker = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {CATEGORY_ICON_OPTIONS.map((iconKey) => (
      <button
        key={iconKey}
        type="button"
        onClick={() => onChange(iconKey)}
        aria-label={iconKey}
        aria-pressed={value === iconKey}
        className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
          value === iconKey ? 'border-lake bg-lake-50 text-lake' : 'border-navy/10 text-slate hover:border-lake/40'
        }`}
      >
        <CategoryIcon name={iconKey} size={13} strokeWidth={1.75} />
      </button>
    ))}
  </div>
)

export default IconPicker
