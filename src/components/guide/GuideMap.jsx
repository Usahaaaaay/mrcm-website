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
// `{ pan: false }`: invalidateSize()'s default behavior doesn't just redraw
// tiles at the same center — when it measures a real container-size
// difference, it calls the private _rawPanBy() internally to re-center the
// same geographic point at the new container's middle. Paired with
// trackResize={false} below (Leaflet's own independent native window-resize
// listener, which has no pan:false equivalent), neither of the two places
// that can react to a container resize are ever allowed to recenter the map
// on their own.
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

// One destination is always one row (see src/services/destinationService.js),
// so no client-side grouping/dedup step is needed here — MarkerLayer clusters
// purely for on-screen legibility, not because of duplicate data.
//
// Selecting a destination — by tapping its marker, tapping a spiderfied
// member, picking it from the sidebar list, or search/filter narrowing to a
// single result — only ever flows into `onSelectLocation`, which just
// updates `selectedId` state one level up (TekapoGuidePage.jsx). Nothing in
// this component (or anywhere else in the guide feature) reacts to that
// state change by moving the camera. The map only ever moves via: the
// user's own touch/mouse gestures (Leaflet's native pan/zoom handling,
// untouched here), tapping a cluster bubble to zoom into it
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
      // trackResize={false}: Leaflet's Map has its own independent,
      // always-on-by-default native window-resize listener that calls
      // invalidateSize() *with* panning — separate from, and in addition
      // to, MapResizeHandler below. It has no pan:false equivalent to opt
      // out of, so the only way to stop it is to disable it here.
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
    </MapContainer>
  )
}

export default GuideMap
