import { useCallback, useEffect, useRef } from 'react'
import L from 'leaflet'
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

// Breathing room (px) kept between a marker and the edge of the "safe" area
// — the map viewport minus whatever floating chrome currently overlaps it —
// when nudging it into view.
const VISIBILITY_MARGIN_PX = 24

const getChromeRect = (attr) => {
  const el = document.querySelector(`[data-map-chrome="${attr}"]`)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  // `display: none` (both are `md:hidden` on desktop/tablet) collapses every
  // edge to 0 rather than making the element simply absent — indistinguishable
  // from "a real element positioned at the origin" unless checked explicitly.
  // Treated as "no chrome" here, which is what it actually means on desktop.
  return rect.width === 0 && rect.height === 0 ? null : rect
}

/**
 * Brings an off-screen destination into view when it's selected from the
 * sidebar list or search — and does absolutely nothing else. Never touches
 * zoom, and (per `directTapRef`, set by GuideMap immediately before calling
 * onSelectLocation for any direct marker/spiderfy tap) never moves the
 * camera at all for a destination selected by tapping its own marker: that
 * marker is inherently already on screen, since the user just tapped it
 * there, and — like Google/Apple Maps — a tap should only ever change what
 * the popup shows, never where the camera is looking. The same "already on
 * screen" rule applies to a sidebar/search selection too: it only pans if
 * the destination is genuinely outside the current view.
 *
 * This used to unconditionally `flyTo(..., FOCUS_ZOOM)` on every selection,
 * then later a chrome-aware `panTo` nudge whenever the marker/popup was even
 * slightly obstructed. Neither was actually the reason ordinary marker taps
 * kept moving the camera afterwards, though — that turned out to be entirely
 * outside this component. Confirmed by instrumenting every Leaflet
 * camera-moving method plus movestart/zoomstart with a captured call stack:
 * clicking a marker's icon gives it native DOM focus (it's a focusable
 * `<div tabindex="0">`), and Leaflet's own `Marker` wires a `focus` listener
 * that calls `map.panInside()` whenever that happens
 * (`Marker.options.autoPanOnFocus`, defaults to `true`) — entirely inside
 * Leaflet's Marker/Icon code, never touching onSelectLocation or this
 * component. That's disabled per-marker in MarkerLayer.jsx now
 * (`autoPanOnFocus={false}`), which is the actual fix; distinguishing
 * direct-tap from sidebar/search selection here still matters for the one
 * remaining legitimate case (an off-screen sidebar/search pick), but it was
 * never what caused the on-screen-tap movement.
 *
 * "Off screen" for a sidebar/search pick still lands the destination inside
 * a chrome-aware safe area (mobile's floating search pill / bottom sheet,
 * read from the real DOM via `[data-map-chrome]` — see GuideLayout.jsx/
 * BottomDrawer.jsx, naturally zero on desktop/tablet where both are
 * `md:hidden`) rather than the raw viewport center, so it doesn't land
 * behind either one.
 */
const KeepSelectedVisible = ({ destination, directTapRef }) => {
  const map = useMap()

  useEffect(() => {
    // Deselecting (e.g. tapping empty map, which also routes through the
    // wrapped setter — see GuideMap.jsx) must not leave a stale `true` behind
    // for the *next* selection to misread as "this one was a direct tap too".
    if (!destination) {
      directTapRef.current = false
      return
    }

    // Direct marker/spiderfy taps: the marker is already on screen by
    // definition (it was just tapped), so the camera never moves — consume
    // the flag and stop here, regardless of anything else.
    if (directTapRef.current) {
      directTapRef.current = false
      return
    }

    const target = L.latLng(destination.latitude, destination.longitude)

    // Sidebar/search pick, but already visible — leave the camera alone too.
    if (map.getBounds().contains(target)) return

    const mapRect = map.getContainer().getBoundingClientRect()
    const topChrome = getChromeRect('top')
    const bottomChrome = getChromeRect('bottom')
    const topInset = topChrome ? Math.max(0, topChrome.bottom - mapRect.top) : 0
    const bottomInset = bottomChrome ? Math.max(0, mapRect.bottom - bottomChrome.top) : 0

    const safeLeft = VISIBILITY_MARGIN_PX
    const safeRight = mapRect.width - VISIBILITY_MARGIN_PX
    const safeTop = topInset + VISIBILITY_MARGIN_PX
    const safeBottom = mapRect.height - bottomInset - VISIBILITY_MARGIN_PX

    const targetPoint = map.latLngToContainerPoint(target)
    const safeCenter = L.point((safeLeft + safeRight) / 2, (safeTop + safeBottom) / 2)
    const currentCenterPoint = map.latLngToContainerPoint(map.getCenter())
    const newCenterPoint = currentCenterPoint.add(L.point(targetPoint.x - safeCenter.x, targetPoint.y - safeCenter.y))

    map.panTo(map.containerPointToLatLng(newCenterPoint), { animate: true, duration: 0.5 })
  }, [destination, map, directTapRef])

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
const MapResizeHandler = () => {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container)

    // Correct for whatever size the container happened to be at the moment
    // Leaflet actually initialized, in case it was already wrong by then.
    map.invalidateSize()

    return () => observer.disconnect()
  }, [map])

  return null
}

// One destination is always one row (see src/services/destinationService.js),
// so no client-side grouping/dedup step is needed here — MarkerLayer clusters
// purely for on-screen legibility, not because of duplicate data.
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

  // Set synchronously, in the same click that calls onSelectLocation — a ref
  // rather than state because KeepSelectedVisible needs to read it the
  // instant `destination` changes, not a render later. Only MarkerLayer's
  // callback below sets it, so a sidebar/search selection (which calls the
  // real onSelectLocation directly, never through this wrapper) always
  // leaves it false, which is exactly the distinction KeepSelectedVisible
  // needs to draw between the two.
  const directTapRef = useRef(false)
  const handleMapSelectLocation = useCallback(
    (id) => {
      directTapRef.current = true
      onSelectLocation(id)
    },
    [onSelectLocation]
  )

  return (
    <MapContainer
      center={TEKAPO_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      zoomAnimation
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
        onSelectLocation={handleMapSelectLocation}
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

      <KeepSelectedVisible destination={selectedDestination} directTapRef={directTapRef} />
      <MapResizeHandler />
      <MapInteractionReporter onInteractionChange={onInteractionChange} />
    </MapContainer>
  )
}

export default GuideMap
