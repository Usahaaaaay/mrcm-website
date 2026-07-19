import { useEffect, useReducer, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useDragControls } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import { MOBILE_SHEET_COLLAPSED_PEEK_PX } from './mapConstants'

// Percentage of the viewport height visible above the bottom edge at the
// 'half'/'full' snap points. The sheet element itself is always
// SHEET_HEIGHT_VH tall; only its vertical offset (y) changes, so a peek of
// map is always visible above it even at 'full' — the map is never fully
// hidden by the drawer. 'collapsed' is deliberately NOT a percentage: it
// peeks exactly MOBILE_SHEET_COLLAPSED_PEEK_PX (the handle/label row's own
// height, nothing more) regardless of viewport size, so the default state is
// just the grab handle — not a slice of the destination list peeking above it.
const SNAP_VH = { half: 50, full: 90 }
const SHEET_HEIGHT_VH = 90
const SNAP_ORDER = ['collapsed', 'half', 'full']
const FLING_VELOCITY_THRESHOLD = 500

const yForSnap = (snap) =>
  snap === 'collapsed'
    ? (window.innerHeight * SHEET_HEIGHT_VH) / 100 - MOBILE_SHEET_COLLAPSED_PEEK_PX
    : (window.innerHeight * (SHEET_HEIGHT_VH - SNAP_VH[snap])) / 100

/**
 * Mobile-only draggable bottom sheet replacing the sidebar destination list.
 * Uses framer-motion's drag-controls pattern (dragListener={false} + a
 * dedicated handle strip that starts the drag via onPointerDown) rather than
 * drag="y" on the whole sheet, because the destination list inside must keep
 * native vertical touch-scroll at the half/full snap points — a naive
 * whole-sheet drag would compete with that scroll for the same gesture.
 *
 * Portaled to document.body: this sheet is `position: fixed`, but
 * GuideLayout's root wrapper is `overflow-hidden` (needed so the map/sidebar
 * area can never trigger page-level scroll) — an overflow-hidden ancestor
 * clips `fixed` descendants that remain its DOM descendants, regardless of
 * `position: fixed` resolving offsets against the viewport. Portaling
 * sidesteps that clipping entirely, the same reason FilterDrawer already
 * portals to document.body.
 */
const BottomDrawer = ({ resultCount, children, className = '' }) => {
  const dragControls = useDragControls()
  const [snap, setSnap] = useState('collapsed')
  // Forces a re-render (recomputing yForSnap against the new viewport height)
  // on resize/orientation change — the drag constraints/animate target
  // otherwise wouldn't know the viewport changed.
  const [, forceUpdate] = useReducer((tick) => tick + 1, 0)

  useEffect(() => {
    let frame = null
    const onResize = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = null
        forceUpdate()
      })
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const handleDragEnd = (_event, info) => {
    const restingY = yForSnap(snap) + info.offset.y
    const currentIndex = SNAP_ORDER.indexOf(snap)

    let nextSnap
    if (Math.abs(info.velocity.y) > FLING_VELOCITY_THRESHOLD) {
      // A fast flick always advances one snap step in the flick's direction,
      // even if the drag distance itself didn't cross the midpoint. SNAP_ORDER
      // goes collapsed(0) -> half(1) -> full(2); a downward flick (velocity.y
      // > 0) moves *towards* collapsed (lower index), an upward flick moves
      // towards full (higher index).
      const direction = info.velocity.y > 0 ? -1 : 1
      nextSnap = SNAP_ORDER[Math.min(Math.max(currentIndex + direction, 0), SNAP_ORDER.length - 1)]
    } else {
      // Otherwise snap to whichever fixed position is nearest a
      // velocity-projected resting point (standard fling-projection weighting).
      const projectedY = restingY + info.velocity.y * 0.15
      nextSnap = SNAP_ORDER.reduce((best, candidate) =>
        Math.abs(yForSnap(candidate) - projectedY) < Math.abs(yForSnap(best) - projectedY) ? candidate : best,
        snap
      )
    }
    setSnap(nextSnap)
  }

  return createPortal(
    <motion.div
      drag="y"
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: yForSnap('collapsed') }}
      dragElastic={0.12}
      animate={{ y: yForSnap(snap) }}
      transition={{ type: 'spring', damping: 32, stiffness: 300 }}
      onDragEnd={handleDragEnd}
      style={{ height: '90vh', touchAction: 'none' }}
      className={`fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-3xl border-t border-navy/8 bg-snow shadow-lift ${className}`}
    >
      <div
        onPointerDown={(event) => dragControls.start(event)}
        // Fixed h-16 (64px) — matches MOBILE_SHEET_COLLAPSED_PEEK_PX exactly,
        // so the 'collapsed' snap peeks precisely this row and nothing else.
        className="flex h-16 shrink-0 cursor-grab flex-col items-center justify-center gap-2 active:cursor-grabbing"
      >
        <span className="h-1.5 w-10 rounded-full bg-navy/15" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setSnap(snap === 'collapsed' ? 'half' : 'collapsed')}
          className="flex items-center gap-1.5 text-sm font-semibold text-navy"
        >
          <ChevronUp size={16} className={`transition-transform ${snap === 'collapsed' ? '' : 'rotate-180'}`} />
          Explore Tekapo &middot; {resultCount} {resultCount === 1 ? 'place' : 'places'}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5" style={{ touchAction: 'pan-y' }}>
        {children}
      </div>
    </motion.div>,
    document.body
  )
}

export default BottomDrawer
