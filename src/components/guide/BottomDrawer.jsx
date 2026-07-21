import { useEffect, useReducer, useRef, useState } from 'react'
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

// How far a pointer has to move before a touch on the list is treated as a
// deliberate drag rather than a tap (so tapping a DestinationCard still
// reaches its onClick) or as a genuine "pull down, nothing left to scroll"
// gesture rather than scroll noise.
const DRAG_HANDOFF_THRESHOLD_PX = 8
const SCROLL_TOP_EPSILON = 2

const yForSnap = (snap) =>
  snap === 'collapsed'
    ? (window.innerHeight * SHEET_HEIGHT_VH) / 100 - MOBILE_SHEET_COLLAPSED_PEEK_PX
    : (window.innerHeight * (SHEET_HEIGHT_VH - SNAP_VH[snap])) / 100

/**
 * Mobile-only draggable bottom sheet replacing the sidebar destination list.
 * Uses framer-motion's drag-controls pattern (dragListener={false} + a
 * dedicated handle strip that starts the drag via onPointerDown) rather than
 * drag="y" on the whole sheet, because the destination list inside must keep
 * native vertical touch-scroll — but only while fully expanded (see below).
 *
 * Portaled to document.body: this sheet is `position: fixed`, but
 * GuideLayout's root wrapper is `overflow-hidden` (needed so the map/sidebar
 * area can never trigger page-level scroll) — an overflow-hidden ancestor
 * clips `fixed` descendants that remain its DOM descendants, regardless of
 * `position: fixed` resolving offsets against the viewport. Portaling
 * sidesteps that clipping entirely, the same reason FilterDrawer already
 * portals to document.body.
 *
 * The list's relationship with the drag gesture is snap-dependent, matching
 * Google/Apple Maps rather than a naive "always scrollable" list:
 *  - At 'half', the list must NOT scroll natively at all — any drag on it
 *    (in either direction) moves the sheet between snap points instead, the
 *    same as dragging the handle. touchAction:'none' stops the browser from
 *    attempting native scroll there in the first place; a small pointer-move
 *    threshold (not a bare pointerdown) is what actually invokes
 *    dragControls.start(), so a plain tap still reaches DestinationCard's
 *    onClick.
 *  - At 'full', the list scrolls natively (touchAction:'pan-y', real
 *    momentum/rubber-band scrolling — not reimplemented in JS) EXCEPT for one
 *    case: if the list was already at scrollTop 0 when the gesture began and
 *    the user keeps pulling down, there's nothing left for native scroll to
 *    consume. touch-action lets the browser's compositor claim that gesture
 *    for native (page) scroll before JS ever runs, and once claimed the
 *    browser can stop delivering further pointer events for it — which is
 *    why, without intervention, that specific gesture is the one that leaks
 *    into page scroll and (on Chrome Android/Samsung Internet) pull-to-
 *    refresh. The fix is a real, non-passive `addEventListener('pointermove',
 *    ..., { passive: false })` (a JSX onPointerMove prop can be registered
 *    passive by default, silently making preventDefault a no-op) that calls
 *    event.preventDefault() at the exact moment of handoff — before the
 *    browser commits to native scroll — then hands off to the SAME
 *    dragControls/dragConstraints/handleDragEnd the handle already uses, so
 *    the sheet collapses instead. This narrow, single-condition
 *    preventDefault is the standard technique for nested
 *    scroll-then-drag-to-dismiss sheets (used by Vaul, Radix's sheet
 *    primitives, etc.) — not a general gesture-hijack.
 */
const BottomDrawer = ({ resultCount, children, className = '' }) => {
  const dragControls = useDragControls()
  const [snap, setSnap] = useState('collapsed')
  const snapRef = useRef(snap)
  const listRef = useRef(null)
  // Forces a re-render (recomputing yForSnap against the new viewport height)
  // on resize/orientation change — the drag constraints/animate target
  // otherwise wouldn't know the viewport changed.
  const [, forceUpdate] = useReducer((tick) => tick + 1, 0)

  useEffect(() => {
    snapRef.current = snap
  }, [snap])

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

  // One shared pointer-tracking listener set for both snap-dependent
  // behaviors described in the class comment above — not two parallel
  // mechanisms. Native listeners (not JSX props) so the 'full'-snap branch's
  // preventDefault() is guaranteed non-passive.
  useEffect(() => {
    const list = listRef.current
    if (!list) return

    let startY = 0
    let scrollTopAtStart = 0
    let handedOff = false

    const onPointerDown = (event) => {
      startY = event.clientY
      scrollTopAtStart = list.scrollTop
      handedOff = false
    }

    const onPointerMove = (event) => {
      if (handedOff) return
      const deltaY = event.clientY - startY

      if (snapRef.current !== 'full') {
        // Not fully expanded: the list never scrolls (touchAction 'none'
        // below already prevents native scroll attempts) — any deliberate
        // drag in either direction hands off to the sheet, same as the handle.
        if (Math.abs(deltaY) > DRAG_HANDOFF_THRESHOLD_PX) {
          handedOff = true
          dragControls.start(event)
        }
        return
      }

      // Fully expanded: let native scroll work normally unless the list was
      // already at its top and the user keeps pulling down — the one
      // gesture with nothing left for native scroll to consume.
      const startedAtTop = scrollTopAtStart <= SCROLL_TOP_EPSILON
      if (startedAtTop && list.scrollTop <= SCROLL_TOP_EPSILON && deltaY > DRAG_HANDOFF_THRESHOLD_PX) {
        handedOff = true
        event.preventDefault()
        dragControls.start(event)
      }
    }

    const onPointerUp = () => {
      handedOff = false
    }

    list.addEventListener('pointerdown', onPointerDown, { passive: true })
    list.addEventListener('pointermove', onPointerMove, { passive: false })
    list.addEventListener('pointerup', onPointerUp, { passive: true })
    list.addEventListener('pointercancel', onPointerUp, { passive: true })
    return () => {
      list.removeEventListener('pointerdown', onPointerDown)
      list.removeEventListener('pointermove', onPointerMove)
      list.removeEventListener('pointerup', onPointerUp)
      list.removeEventListener('pointercancel', onPointerUp)
    }
  }, [dragControls])

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
      style={{ height: '90vh', touchAction: 'none', overscrollBehavior: 'contain' }}
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

      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5"
        style={{ touchAction: snap === 'full' ? 'pan-y' : 'none', overscrollBehavior: 'contain' }}
      >
        {children}
      </div>
    </motion.div>,
    document.body
  )
}

export default BottomDrawer
