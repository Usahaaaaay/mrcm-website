import { Search } from 'lucide-react'

const GuideSearch = ({ value, onChange }) => (
  <div className="relative">
    <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate/50" />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search locations, addresses…"
      className="w-full rounded-full border border-navy/12 bg-snow py-3 pl-11 pr-4 text-sm text-navy placeholder:text-slate/50 focus:border-lake focus:outline-none"
    />
  </div>
)

export default GuideSearch
