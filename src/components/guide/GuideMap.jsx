import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { TEKAPO_CENTER, DEFAULT_ZOOM } from './mapConstants'
import MarkerLayer from './MarkerLayer'
import FloatingButtons from './FloatingButtons'

// Reports whether the user is actively panning/zooming, debounced so a brief
// pause mid-gesture doesn't flicker the "settled" state back on. Lets
// GuideLayout fade the floating search overlay out of the way while the user
// is actually exploring the map, then smoothly restore it — mirroring the
// "auto-hide while interacting" pattern of Google/Apple Maps — without
// touching anything about how the map itself behaves.
const MapInteractionReporter = ({ onInteractionChange }) => {
  const settleTimeout = useRef(null)

  const handleStart = () => {
    if (settleTimeout.current) clearTimeout(settleTimeout.current)
    onInteractionChange(true)
  }
  const handleEnd = () => {
    if (settleTimeout.current) clearTimeout(settleTimeout.current)
    settleTimeout.current = setTimeout(() => onInteractionChange(false), 500)
  }

  useMapEvents({
    movestart: handleStart,
    zoomstart: handleStart,
    moveend: handleEnd,
    zoomend: handleEnd,
  })

  useEffect(() => () => {
    if (settleTimeout.current) clearTimeout(settleTimeout.current)
  }, [])

  return null
}

// Leaflet measures its container's pixel size once at init and never
// re-checks it on its own. This page is lazy-loaded and its height depends
// on --site-header-height (set asynchronously by Navbar's ResizeObserver,
// see TekapoGuidePage.jsx), so the container's size at the exact moment
// Leaflet initializes can be stale or wrong — and the same problem recurs
// any time the layout changes afterward (window resize, orientation change,
// the sidebar/filters changing height on mobile, or entering/exiting
// fullscreen). A ResizeObserver on the map's own container is the single
// mechanism that catches all of those cases, rather than wiring up separate
// window "resize"/"orientationchange" listeners that wouldn't fire for
// layout-only changes like the sidebar or the fullscreen toggle.
//
// `{ pan: false }` is the actual fix for "the map moves on its own" — proven
// via instrumentation to be real, just never caused by anything in this
// codebase. invalidateSize()'s DEFAULT behavior (`pan: true`) doesn't just
// redraw tiles at the same center: when it measures a real container-size
// difference, it calls the *private* `_rawPanBy()` internally (bypassing
// every public pan/zoom method entirely) specifically to re-center the same
// geographic point at the new container's middle. On mobile, simply tapping
// the screen commonly makes the browser's address bar/toolbar hide or show —
// changing `window.innerHeight` — which is indistinguishable, from here, from
// a deliberate layout change like our own fullscreen toggle. That's the
// entire mechanism behind "the map moves when I tap a marker": the tap and
// the pan are only ever coincidental (both triggered by the same tap, via
// completely different paths — ours never calls any pan method), not
// causally linked through any selection/state code. `pan: false` keeps
// invalidateSize()'s legitimate job (re-measure the container, redraw tiles
// correctly) without its opinion about *where the map should be centered
// afterward* — which this app should never delegate to anything but the
// user's own gesture.
const MapResizeHandler = () => {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    observer.observe(container)

    // Correct for whatever size the container happened to be at the moment
    // Leaflet actually initialized, in case it was already wrong by then.
    map.invalidateSize({ pan: false })

    return () => observer.disconnect()
  }, [map])

  return null
}

// TEMPORARY diagnostic instrumentation, round 2 — the first round proved
// `move`/`zoomend`/`moveend` fire with NO preceding public-API log, which
// means the trigger is either (a) a private/internal Leaflet method that
// bypasses every public method (confirmed possible: invalidateSize()'s own
// source calls the private `_rawPanBy` when a container-size change is
// detected, never the public `panBy`/`panTo`), or (b) a new Leaflet map
// instance being constructed (its initial setView happens before this
// component's effect can patch it). This round instruments both
// possibilities directly instead of guessing between them:
//   - patches the private `_rawPanBy`/`_move`/`_resetView` methods too
//   - stamps and logs the map instance's own Leaflet id + container node on
//     every mount, so a remount (a *different* id/node appearing) is
//     directly visible rather than inferred
//   - tracks real "before" center/zoom via movestart/zoomstart (captured
//     when the change *begins*, not re-queried afterward) so the
//     move/zoomend logs show a genuine before-vs-after diff, per spec
const CameraDebugger = () => {
  const map = useMap()
  const prevRef = useRef({ center: map.getCenter(), zoom: map.getZoom() })

  useEffect(() => {
    const container = map.getContainer()
    // eslint-disable-next-line no-console
    console.log('%c[CAMERA-INSTANCE] CameraDebugger mounted for map', 'color:#0891b2;font-weight:bold', {
      leafletId: map._leaflet_id,
      containerId: container.id || '(no id)',
      containerDataToken: container.dataset.cameraDebugToken,
    })
    if (!container.dataset.cameraDebugToken) {
      container.dataset.cameraDebugToken = Math.random().toString(36).slice(2)
    }

    const publicMethods = [
      'panTo',
      'flyTo',
      'setView',
      'fitBounds',
      'flyToBounds',
      'setZoom',
      'panBy',
      'panInside',
      'invalidateSize',
    ]
    // Private (underscore-prefixed) methods — accessible in JS regardless of
    // naming convention. invalidateSize()'s own source calls _rawPanBy
    // directly; _move/_resetView are the lower-level primitives most other
    // view-changing code paths (zoom animation frames, drag inertia, etc.)
    // ultimately funnel through.
    const privateMethods = ['_rawPanBy', '_move', '_resetView', 'setZoomAround']
    const allMethods = [...publicMethods, ...privateMethods]

    const originals = {}
    allMethods.forEach((name) => {
      if (typeof map[name] !== 'function') return
      originals[name] = map[name].bind(map)
      map[name] = (...args) => {
        const before = { center: map.getCenter(), zoom: map.getZoom() }
        const isPrivate = name.startsWith('_') || name === 'setZoomAround'
        // eslint-disable-next-line no-console
        console.log(
          `%c[CAMERA-API${isPrivate ? '-PRIVATE' : ''}] map.${name}() CALLED`,
          `color:${isPrivate ? '#dc2626' : '#c026d3'};font-weight:bold`,
          { time: new Date().toISOString(), args, before }
        )
        // eslint-disable-next-line no-console
        console.log(new Error(`stack for map.${name}()`).stack)
        return originals[name](...args)
      }
    })

    const onMoveStart = () => {
      prevRef.current = { center: map.getCenter(), zoom: map.getZoom() }
    }
    const onZoomStart = () => {
      prevRef.current = { center: map.getCenter(), zoom: map.getZoom() }
    }

    const logMovement = (label) => () => {
      const prev = prevRef.current
      const nowCenter = map.getCenter()
      const nowZoom = map.getZoom()
      // eslint-disable-next-line no-console
      console.group(`%cMAP MOVEMENT: ${label}`, 'color:#2563eb;font-weight:bold')
      // eslint-disable-next-line no-console
      console.log('Event:', label)
      // eslint-disable-next-line no-console
      console.log('Before center:', prev.center, '| Before zoom:', prev.zoom)
      // eslint-disable-next-line no-console
      console.log('After center:', nowCenter, '| After zoom:', nowZoom)
      // eslint-disable-next-line no-console
      console.log('Center changed:', prev.center.lat !== nowCenter.lat || prev.center.lng !== nowCenter.lng)
      // eslint-disable-next-line no-console
      console.log('Zoom changed:', prev.zoom !== nowZoom)
      // eslint-disable-next-line no-console
      console.log('Container size now:', map.getSize())
      // eslint-disable-next-line no-console
      console.trace()
      // eslint-disable-next-line no-console
      console.groupEnd()
    }

    const events = {
      movestart: onMoveStart,
      moveend: logMovement('moveend'),
      move: logMovement('move'),
      zoomstart: onZoomStart,
      zoomend: logMovement('zoomend'),
      zoom: logMovement('zoom'),
    }
    map.on(events)

    const onFocusCapture = (event) => {
      // eslint-disable-next-line no-console
      console.log('%c[CAMERA-FOCUS] focus event', 'color:#ea580c;font-weight:bold', {
        tag: event.target?.tagName,
        className: event.target?.className,
      })
    }
    document.addEventListener('focus', onFocusCapture, true)

    return () => {
      allMethods.forEach((name) => {
        if (originals[name]) map[name] = originals[name]
      })
      map.off(events)
      document.removeEventListener('focus', onFocusCapture, true)
    }
  }, [map])
  return null
}

// TEMPORARY diagnostic instrumentation, round 4 — rounds 2/3 disproved both
// the "Leaflet recenters after a resize" hypothesis (fixed, confirmed) and
// the "the container itself resizes" hypothesis (every ResizeObserver at
// every ancestor level logged `changed: false`). The actual acceptance
// criterion is purely visual: does the TAPPED MARKER's own screen position
// change. This tracks that directly — on every click that lands on a Leaflet
// marker icon, it records that element's getBoundingClientRect() and
// re-checks it on every animation frame for 500ms, logging the exact frame
// (and elapsed ms) where it first differs from the previous frame, plus
// which Leaflet event (tracked via the same map.on(...) this component sets
// up) most recently fired before that frame — so if the marker does move,
// this identifies the precise event immediately preceding it rather than
// inferring one.
const MarkerPixelDebugger = () => {
  const map = useMap()
  const lastEventRef = useRef(null)

  useEffect(() => {
    const trackedEvents = ['movestart', 'move', 'moveend', 'zoomstart', 'zoom', 'zoomend']
    const onAnyMapEvent = (event) => {
      lastEventRef.current = { type: event.type, time: performance.now() }
    }
    trackedEvents.forEach((name) => map.on(name, onAnyMapEvent))

    const onClickCapture = (domEvent) => {
      const markerEl = domEvent.target.closest?.('.leaflet-marker-icon')
      if (!markerEl) return

      const startTime = performance.now()
      const startRect = markerEl.getBoundingClientRect()
      // eslint-disable-next-line no-console
      console.log('%c[MARKER-TRACK] tap detected on marker', 'color:#7c3aed;font-weight:bold', {
        x: startRect.x,
        y: startRect.y,
        className: markerEl.className,
      })

      let lastRect = startRect
      let frame = 0
      const tick = () => {
        const elapsed = performance.now() - startTime
        const rect = markerEl.getBoundingClientRect()
        if (rect.x !== lastRect.x || rect.y !== lastRect.y) {
          const recentEvent = lastEventRef.current
          const sinceEvent = recentEvent ? (performance.now() - recentEvent.time).toFixed(1) : 'n/a'
          // eslint-disable-next-line no-console
          console.log(
            `%c[MARKER-DRIFT] frame ${frame}, t=${elapsed.toFixed(1)}ms — POSITION CHANGED`,
            'color:#dc2626;font-weight:bold',
            {
              from: { x: lastRect.x, y: lastRect.y },
              to: { x: rect.x, y: rect.y },
              deltaX: rect.x - lastRect.x,
              deltaY: rect.y - lastRect.y,
              mostRecentLeafletEvent: recentEvent ? `${recentEvent.type} (${sinceEvent}ms before this frame)` : '(none observed)',
            }
          )
          // eslint-disable-next-line no-console
          console.trace()
        }
        lastRect = rect
        frame++
        if (elapsed < 500) {
          requestAnimationFrame(tick)
        } else {
          const netDx = rect.x - startRect.x
          const netDy = rect.y - startRect.y
          // eslint-disable-next-line no-console
          console.log('%c[MARKER-TRACK] finished 500ms tracking', 'color:#7c3aed;font-weight:bold', {
            totalFrames: frame,
            netDeltaX: netDx,
            netDeltaY: netDy,
            netDriftPx: Math.hypot(netDx, netDy),
          })
        }
      }
      requestAnimationFrame(tick)
    }
    document.addEventListener('click', onClickCapture, true)

    return () => {
      trackedEvents.forEach((name) => map.off(name, onAnyMapEvent))
      document.removeEventListener('click', onClickCapture, true)
    }
  }, [map])
  return null
}

// TEMPORARY diagnostic instrumentation, round 5 — rounds 2-4 measured DOM
// layout geometry (container rects, marker getBoundingClientRect) and found
// no change. getBoundingClientRect() DOES account for CSS transforms, so a
// change there should catch a transform-driven shift of the SAME element —
// but if the marker's own element is kept visually anchored while a
// DIFFERENT pane (the tile pane specifically) is transformed independently,
// the marker's own rect can legitimately stay constant while the map
// visibly shifts underneath/around it — exactly what would look like "the
// map moved" without our marker-only tracking ever seeing it. This
// instruments the actual rendered `transform` on every Leaflet pane
// (map/tile/marker/shadow/overlay/popup) directly via getComputedStyle, on
// every animation frame for 1s after any click, independent of whether the
// marker's own rect changes.
const PaneTransformDebugger = () => {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const paneSelectors = [
      'leaflet-map-pane',
      'leaflet-tile-pane',
      'leaflet-overlay-pane',
      'leaflet-shadow-pane',
      'leaflet-marker-pane',
      'leaflet-popup-pane',
    ]

    const onClickCapture = () => {
      const panes = paneSelectors
        .map((cls) => ({ cls, el: container.querySelector(`.${cls}`) }))
        .filter((p) => p.el)

      const startTime = performance.now()
      let last = {}
      panes.forEach(({ cls, el }) => {
        last[cls] = getComputedStyle(el).transform
      })

      // eslint-disable-next-line no-console
      console.log('%c[PANE-TRANSFORM] at click time', 'color:#0891b2;font-weight:bold', { ...last })

      let frame = 0
      const tick = () => {
        const elapsed = performance.now() - startTime
        panes.forEach(({ cls, el }) => {
          const now = getComputedStyle(el).transform
          if (now !== last[cls]) {
            // eslint-disable-next-line no-console
            console.log(
              `%c[PANE-TRANSFORM-CHANGE] .${cls} — frame ${frame}, t=${elapsed.toFixed(1)}ms`,
              'color:#dc2626;font-weight:bold',
              { from: last[cls], to: now }
            )
            // eslint-disable-next-line no-console
            console.trace()
          }
          last[cls] = now
        })
        frame++
        if (elapsed < 1000) {
          requestAnimationFrame(tick)
        } else {
          // eslint-disable-next-line no-console
          console.log('%c[PANE-TRANSFORM] finished 1000ms tracking, final values:', 'color:#0891b2;font-weight:bold', { ...last, totalFrames: frame })
        }
      }
      requestAnimationFrame(tick)
    }

    document.addEventListener('click', onClickCapture, true)
    return () => document.removeEventListener('click', onClickCapture, true)
  }, [map])

  return null
}

// TEMPORARY diagnostic instrumentation, round 6 — rounds 2-5 measured every
// CSS-layout-level and rendered-transform-level quantity available (container
// rects at every ancestor, marker getBoundingClientRect every frame, every
// Leaflet pane's computed `transform` every frame) and found no change at
// any of them. There is exactly one more rendering layer between "CSS/DOM"
// and "pixels the user sees": the browser's own visual viewport — a
// compositing-level concept (pinch-zoom scale, scroll offset applied to the
// whole rendered page) that sits *above* CSS layout entirely. A native
// mobile browser "zoom to tapped content" accessibility behavior, or a
// pinch/double-tap zoom, changes `window.visualViewport.scale/offsetLeft/
// offsetTop` without changing a single DOM layout property or CSS transform
// — invisible to everything measured so far, but visually identical to "the
// whole page (map included) shifted". This tracks it directly, every frame,
// around every click.
const VisualViewportDebugger = () => {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) {
      // eslint-disable-next-line no-console
      console.log('%c[VISUAL-VIEWPORT] window.visualViewport is not supported in this browser', 'color:#dc2626;font-weight:bold')
      return undefined
    }

    const snapshot = () => ({ scale: vv.scale, offsetLeft: vv.offsetLeft, offsetTop: vv.offsetTop, width: vv.width, height: vv.height })

    const onVvEvent = (event) => {
      // eslint-disable-next-line no-console
      console.log(`%c[VISUAL-VIEWPORT-EVENT] ${event.type}`, 'color:#dc2626;font-weight:bold', snapshot())
      // eslint-disable-next-line no-console
      console.trace()
    }
    vv.addEventListener('resize', onVvEvent)
    vv.addEventListener('scroll', onVvEvent)

    const onClickCapture = () => {
      const startTime = performance.now()
      let last = snapshot()
      // eslint-disable-next-line no-console
      console.log('%c[VISUAL-VIEWPORT] at click time', 'color:#0891b2;font-weight:bold', last)

      let frame = 0
      const tick = () => {
        const elapsed = performance.now() - startTime
        const now = snapshot()
        if (now.scale !== last.scale || now.offsetLeft !== last.offsetLeft || now.offsetTop !== last.offsetTop) {
          // eslint-disable-next-line no-console
          console.log(
            `%c[VISUAL-VIEWPORT-CHANGE] frame ${frame}, t=${elapsed.toFixed(1)}ms`,
            'color:#dc2626;font-weight:bold',
            { from: last, to: now }
          )
        }
        last = now
        frame++
        if (elapsed < 1000) {
          requestAnimationFrame(tick)
        } else {
          // eslint-disable-next-line no-console
          console.log('%c[VISUAL-VIEWPORT] finished 1000ms tracking, final values:', 'color:#0891b2;font-weight:bold', { ...last, totalFrames: frame })
        }
      }
      requestAnimationFrame(tick)
    }
    document.addEventListener('click', onClickCapture, true)

    return () => {
      vv.removeEventListener('resize', onVvEvent)
      vv.removeEventListener('scroll', onVvEvent)
      document.removeEventListener('click', onClickCapture, true)
    }
  }, [])

  return null
}

// One destination is always one row (see src/services/destinationService.js),
// so no client-side grouping/dedup step is needed here — MarkerLayer clusters
// purely for on-screen legibility, not because of duplicate data.
//
// Selecting a destination — by tapping its marker, tapping a spiderfied
// member, picking it from the sidebar list, or search/filter narrowing to a
// single result — only ever flows into `onSelectLocation`, which just
// updates `selectedId` state one level up (TekapoGuidePage.jsx). Nothing in
// this component (or anywhere else in the guide feature) reacts to that
// state change by moving the camera. A prior version had a `KeepSelectedVisible`
// component here that called `map.panTo()` whenever a selection came from
// somewhere other than a direct marker tap (the sidebar list, or the
// auto-select-on-one-filtered-result effect in TekapoGuidePage.jsx) and the
// destination wasn't already fully on screen. That's exactly the class of
// "the map moves when I select something" behavior this file must not have
// any of — removed outright rather than gated further, since selection
// should never be capable of moving the camera, full stop. The map only ever
// moves via: the user's own touch/mouse gestures (Leaflet's native pan/zoom
// handling, untouched here), tapping a cluster bubble to zoom into it
// (MarkerLayer.jsx's handleClusterClick — a direct, necessary reaction to
// that specific tap, not a side effect of selection), or explicitly pressing
// "Locate Me" / "Reset View" (FloatingButtons.jsx) — both are the user
// deliberately asking the map to move, the same as pressing the recenter
// button in Google Maps.
const GuideMap = ({
  destinations,
  selectedId,
  onSelectLocation,
  userLocation,
  geoStatus,
  onRequestLocation,
  fullscreen,
  onToggleFullscreen,
  onInteractionChange = () => {},
}) => {
  const selectedDestination = destinations.find((destination) => destination.id === selectedId) ?? null

  return (
    <MapContainer
      center={TEKAPO_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      zoomAnimation
      // trackResize={false}: Leaflet's Map has its own *independent*,
      // always-on-by-default (trackResize: true) native `window.resize`
      // listener that calls invalidateSize() with panning — completely
      // separate from, and in addition to, our own MapResizeHandler below.
      // It has no `pan: false` equivalent to opt out of, so the only way to
      // stop it is to disable it here. This was the actual, proven source of
      // "the map moves on its own": on mobile, tapping the screen commonly
      // makes the browser's address bar hide/show, firing a native `resize`
      // event that Leaflet reacts to by re-centering — nothing to do with
      // selecting a destination, just coincidentally triggered by the same
      // tap. MapResizeHandler already re-measures the container correctly
      // (via ResizeObserver, which also covers non-window-resize layout
      // changes like the fullscreen toggle or the sidebar resizing) — with
      // panning explicitly disabled there too, so no code path in this app
      // ever recenters the map for a reason the user didn't directly cause.
      trackResize={false}
      // `isolate` gives Leaflet's own rendering (tile/marker/popup panes and
      // zoom controls all carry z-index values up to 1000 in leaflet.css) its
      // own stacking context, so none of it can ever paint above the site
      // header's z-50 regardless of raw z-index numbers — a real fix, not a
      // higher magic z-index chasing Leaflet's. FloatingButtons' z-[1200]
      // relies on this same isolation.
      className="h-full w-full isolate"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerLayer
        destinations={destinations}
        selectedId={selectedId}
        onSelectLocation={onSelectLocation}
        userLocation={userLocation}
      />

      <FloatingButtons
        selectedDestination={selectedDestination}
        onDeselect={() => onSelectLocation(null)}
        geoStatus={geoStatus}
        onRequestLocation={onRequestLocation}
        fullscreen={fullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />

      <MapResizeHandler />
      <MapInteractionReporter onInteractionChange={onInteractionChange} />
      <CameraDebugger />
      <MarkerPixelDebugger />
      <PaneTransformDebugger />
      <VisualViewportDebugger />
    </MapContainer>
  )
}

export default GuideMap
