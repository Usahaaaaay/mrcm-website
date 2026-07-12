import { Search } from 'lucide-react'

const SearchInput = ({ value, onChange, placeholder = 'Search…', className = '' }) => (
  <div className={`relative ${className}`}>
    <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate/50" />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-full border border-navy/12 bg-snow py-2.5 pl-10 pr-4 text-sm text-navy placeholder:text-slate/50 focus:border-lake focus:outline-none"
    />
  </div>
)

export default SearchInput
