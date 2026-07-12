const Badge = ({ children, className = '' }) => (
  <span
    className={`inline-flex items-center rounded-full border border-navy/10 bg-cloud px-3 py-1 text-xs font-medium text-slate ${className}`}
  >
    {children}
  </span>
)

export default Badge
