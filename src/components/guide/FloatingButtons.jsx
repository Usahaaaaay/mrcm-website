import { useMap } from 'react-leaflet'
import { LocateFixed, RotateCcw, Maximize, Minimize2, Navigation } from 'lucide-react'
import { TEKAPO_CENTER, DEFAULT_ZOOM, FOCUS_ZOOM } from './mapConstants'

const buttonClasses =
  'flex h-11 w-11 items-center justify-center rounded-full bg-snow text-navy shadow-lift transition-colors hover:text-lake disabled:opacity-40'

/**
 * Rendered as a child of <MapContainer> (useMap(), same pattern as
 * FlyToSelected/MapResizeHandler/MarkerLayer) so it can drive the map
 * instance directly without threading a ref up through GuideLayout.
 * z-[1200] clears Leaflet's own panes/controls (capped at z-index:1000 in
 * leaflet.css) — safe because MapContainer already carries `isolate`
 * (see GuideMap.jsx), fencing this off from the site header's z-50 rather
 * than needing an ever-larger z-index.
 */
const FloatingButtons = ({
  selectedDestination,
  onDeselect,
  geoStatus,
  onRequestLocation,
  fullscreen,
  onToggleFullscreen,
}) => {
  const map = useMap()

  const handleLocate = async () => {
    const coords = await onRequestLocation()
    if (coords) map.flyTo([coords.lat, coords.lng], FOCUS_ZOOM, { duration: 0.75 })
  }

  const handleReset = () => {
    onDeselect()
    map.flyTo(TEKAPO_CENTER, DEFAULT_ZOOM, { duration: 0.75 })
  }

  const handleDirections = () => {
    if (!selectedDestination) return
    const { latitude, longitude } = selectedDestination
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank', 'noopener,noreferrer')
  }

  const locateUnavailable = geoStatus === 'denied' || geoStatus === 'unsupported'

  return (
    // Mobile: `fixed` (not `absolute`) so the offset is measured against the
    // true viewport, the same reference frame BottomDrawer's snap points use
    // — the map's own box is only ~65vh of an already header-reduced space,
    // a different, smaller reference that "27vh-from-the-map's-own-bottom-
    // edge" can't reliably clear. bottom-[calc(25vh+1rem)] clears the
    // drawer's 25vh collapsed height (also true-viewport-relative) plus a
    // small margin. Desktop/tablet (md+): back to `absolute` within the map
    // panel's own box, since there's no drawer and the panel sits beside a
    // sidebar rather than spanning the full viewport.
    <div className="fixed bottom-[calc(25vh+1rem)] right-4 z-[1200] flex flex-col gap-2 md:absolute md:bottom-4">
      {selectedDestination ? (
        <button
          type="button"
          onClick={handleDirections}
          aria-label="Get directions"
          title="Get directions"
          className={buttonClasses}
        >
          <Navigation size={18} />
        </button>
      ) : null}

      <button
        type="button"
        onClick={onToggleFullscreen}
        aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        className={buttonClasses}
      >
        {fullscreen ? <Minimize2 size={18} /> : <Maximize size={18} />}
      </button>

      <button type="button" onClick={handleReset} aria-label="Reset map view" title="Reset map view" className={buttonClasses}>
        <RotateCcw size={18} />
      </button>

      <button
        type="button"
        onClick={handleLocate}
        disabled={geoStatus === 'locating'}
        aria-label={locateUnavailable ? 'Location unavailable' : 'Find my location'}
        title={locateUnavailable ? 'Location unavailable' : 'Find my location'}
        className={`${buttonClasses} ${locateUnavailable ? 'opacity-40' : ''}`}
      >
        <LocateFixed size={18} />
      </button>
    </div>
  )
}

export default FloatingButtons
