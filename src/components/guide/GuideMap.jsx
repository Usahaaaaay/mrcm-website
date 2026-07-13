import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { createCategoryDivIcon } from './mapIcons'
import DestinationPopup from './DestinationPopup'

const TEKAPO_CENTER = [-44.0068, 170.4779]
const DEFAULT_ZOOM = 13
const FOCUS_ZOOM = 15

const FlyToSelected = ({ destination }) => {
  const map = useMap()

  useEffect(() => {
    if (destination) {
      map.flyTo([destination.latitude, destination.longitude], FOCUS_ZOOM, { duration: 0.75 })
    }
  }, [destination, map])

  return null
}

// One destination is always one row (see src/services/destinationService.js),
// so this renders 1:1 — no client-side grouping/dedup step is needed here at
// all, unlike the old locations model.
const GuideMap = ({ destinations, selectedId, onSelectLocation }) => {
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
      // higher magic z-index chasing Leaflet's.
      className="h-full w-full isolate"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {destinations.map((destination) => (
        <Marker
          key={destination.id}
          position={[destination.latitude, destination.longitude]}
          icon={createCategoryDivIcon(destination.categories[0], { active: destination.id === selectedId })}
          eventHandlers={{ click: () => onSelectLocation(destination.id) }}
        >
          <Popup minWidth={220}>
            <DestinationPopup destination={destination} />
          </Popup>
        </Marker>
      ))}

      <FlyToSelected destination={selectedDestination} />
    </MapContainer>
  )
}

export default GuideMap
