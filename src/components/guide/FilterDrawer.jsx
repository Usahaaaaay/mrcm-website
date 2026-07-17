import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import GuideFilters from './GuideFilters'

/** A mobile-only slide-up sheet wrapping the existing (unchanged) GuideFilters
 *  grouped view — the same body desktop/tablet show inline in the sidebar.
 *  Follows admin/components/Modal.jsx's conventions (portal, Escape + backdrop
 *  close, body-scroll-lock) but slides up from the bottom instead of a
 *  centered scale/fade, since no drawer variant of Modal exists. */
const FilterDrawer = ({ open, onClose, selected, onToggle }) => {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[1300] flex items-end justify-center md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Filter by category"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-h-[80vh] w-full overflow-y-auto rounded-t-3xl border-t border-navy/8 bg-snow p-6 shadow-lift"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-navy">Filter by Category</h2>
              <div className="flex items-center gap-3">
                {selected.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => selected.forEach(onToggle)}
                    className="text-xs font-medium text-lake hover:underline"
                  >
                    Clear all
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close filters"
                  className="rounded-full p-1.5 text-slate hover:text-navy"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <GuideFilters selected={selected} onToggle={onToggle} />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}

export default FilterDrawer
