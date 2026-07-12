const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-navy/8 ${className}`} />
)

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }, (_, j) => (
          <Skeleton key={j} className="h-10 flex-1" />
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonCards = ({ count = 6 }) => (
  <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} className="aspect-square" />
    ))}
  </div>
)

export default Skeleton
