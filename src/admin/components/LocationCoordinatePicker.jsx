import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { createCategoryDivIcon } from '../../components/guide/mapIcons'

const TEKAPO_CENTER = [-44.0068, 170.4779]

const ClickToPlace = ({ onChange }) => {
  useMapEvents({
    click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }),
  })
  return null
}

/** Small click-to-place map used inside the admin location form — pairs with the
 *  plain latitude/longitude number inputs so coordinates can be set either way. */
const LocationCoordinatePicker = ({ latitude, longitude, category, onChange }) => {
  const position = latitude && longitude ? [latitude, longitude] : TEKAPO_CENTER

  return (
    <div className="h-52 w-full overflow-hidden rounded-2xl border border-navy/12">
      <MapContainer center={position} zoom={latitude && longitude ? 14 : 11} className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {latitude && longitude ? (
          <Marker
            position={position}
            draggable
            icon={createCategoryDivIcon(category, { active: true })}
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng()
                onChange({ lat, lng })
              },
            }}
          />
        ) : null}
        <ClickToPlace onChange={onChange} />
      </MapContainer>
    </div>
  )
}

export default LocationCoordinatePicker
