import { useCategories } from '../hooks/useCategories'

const CategorySelect = ({ value, onChange, allowNone = true, className = '' }) => {
  const { rows } = useCategories({ from: 0, to: 999 })

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={`w-full rounded-2xl border border-navy/12 bg-snow px-4 py-3 text-sm text-navy focus:border-lake focus:outline-none ${className}`}
    >
      {allowNone ? <option value="">No category</option> : null}
      {rows.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  )
}

export default CategorySelect
