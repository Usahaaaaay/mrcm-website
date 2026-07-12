import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  )

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate transition-colors hover:bg-lake-50 hover:text-lake disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1]
        const gap = prev && p - prev > 1
        return (
          <span key={p} className="flex items-center gap-1.5">
            {gap ? <span className="px-1 text-slate/50">…</span> : null}
            <button
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                p === page ? 'bg-lake text-snow' : 'text-slate hover:bg-lake-50 hover:text-lake'
              }`}
            >
              {p}
            </button>
          </span>
        )
      })}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate transition-colors hover:bg-lake-50 hover:text-lake disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}

export default Pagination
