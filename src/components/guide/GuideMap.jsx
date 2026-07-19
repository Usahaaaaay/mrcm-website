import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { TEKAPO_CENTER, DEFAULT_ZOOM, FOCUS_ZOOM } from './mapConstants'
import MarkerLayer from './MarkerLayer'
import FloatingButtons from './FloatingButtons'

/**
 * Brings a newly selected destination into view — but only ever pans/zooms
 * IN, never out, and does nothing at all if it's already comfortably
 * visible. This used to unconditionally `flyTo(..., FOCUS_ZOOM)` on every
 * selection, which is a regression once a destination can be selected by
 * clicking a marker that's already on screen at a deep zoom (e.g. one of a
 * spiderfied cluster's fanned-out members, shown at zoom >= 18): FOCUS_ZOOM
 * (15) is *lower* than the zoom spiderfying requires, so that flyTo was
 * always zooming straight back out the moment a spiderfied marker was
 * clicked — which in turn re-triggered clustering at the new, wider zoom
 * before the click's own selection/popup could register. Selecting from the
 * sidebar list or search while looking at a different part of the map still
 * needs to fly the view to it — that's the only case this still does.
 */
const FlyToSelected = ({ destination }) => {
  const map = useMap()

  useEffect(() => {
    if (!destination) return

    const target = L.latLng(destination.latitude, destination.longitude)
    const currentZoom = map.getZoom()
    const viewportBounds = map.getBounds()

    // Already comfortably in view (not just barely, hugging an edge) — the
    // user just interacted with this exact marker on screen. Moving the view
    // at all here would be the surprising, unwanted "zooms back out" bug.
    if (viewportBounds.pad(-0.25).contains(target)) return

    // Visible, but close to an edge — a gentle pan (no zoom change) is
    // enough to bring it fully into view.
    if (viewportBounds.contains(target)) {
      map.panTo(target, { animate: true, duration: 0.5 })
      return
    }

    // Not visible at all (e.g. selected from the sidebar/search while
    // looking elsewhere) — fly to it, but never zoom OUT from wherever the
    // user already was.
    map.flyTo(target, Math.max(currentZoom, FOCUS_ZOOM), { duration: 0.75 })
  }, [destination, map])

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
}) => {
  const selectedDestination = destinations.find((destination) => destination.id === selectedId) ?? null

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

      <FlyToSelected destination={selectedDestination} />
      <MapResizeHandler />
    </MapContainer>
  )
}

export default GuideMap
