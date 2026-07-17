import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import { getLocationCategory } from '../../lib/locationCategories'

const iconCache = new Map()
const SIZE = 32
const ICON_SIZE = 15

/**
 * Builds a Leaflet divIcon (colored pin + category icon) — cached per
 * category, and deliberately identical regardless of selection state.
 *
 * This used to grow/change on selection (an `active` flag producing a
 * different, bigger icon). That meant react-leaflet called the underlying
 * marker's setIcon() on selection — and Leaflet's setIcon() unconditionally
 * re-runs bindPopup() on any already-open popup as a side effect (see
 * Marker.prototype.setIcon in leaflet-src.js), closing the popup moments
 * after the same click had just opened it. Keeping this icon's identity
 * (and therefore its object reference) completely stable regardless of
 * selection avoids ever calling setIcon() for that reason, which removes the
 * bug at its source rather than compensating for the side effect afterward.
 * "Selected" is instead shown via a separate, independent pulsing ring
 * overlay — see createSelectionRingIcon below — which never touches this
 * marker's own icon or popup binding.
 */
export function createCategoryDivIcon(categoryValue) {
  if (iconCache.has(categoryValue)) return iconCache.get(categoryValue)

  const { icon: Icon, color } = getLocationCategory(categoryValue)

  const html = renderToStaticMarkup(
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: SIZE,
        height: SIZE,
        borderRadius: '50%',
        background: color,
        border: '2px solid #FAFAF8',
        boxShadow: '0 2px 6px rgba(16,42,67,0.35)',
      }}
    >
      <Icon size={ICON_SIZE} color="#FAFAF8" strokeWidth={2} />
    </span>
  )

  const divIcon = L.divIcon({
    html,
    className: 'location-marker-icon',
    iconSize: [SIZE, SIZE],
    iconAnchor: [SIZE / 2, SIZE / 2],
    popupAnchor: [0, -SIZE / 2],
  })

  iconCache.set(categoryValue, divIcon)
  return divIcon
}

let selectionRingIcon = null

/** A single, never-varying pulsing ring — rendered as its own independent,
 *  non-interactive marker at the selected destination's position (never as
 *  part of the destination's own marker/icon, see createCategoryDivIcon). */
export function createSelectionRingIcon() {
  if (selectionRingIcon) return selectionRingIcon

  const size = 64
  const html = renderToStaticMarkup(
    <span
      className="animate-ping"
      style={{
        display: 'block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(45, 110, 146, 0.35)',
      }}
    />
  )

  selectionRingIcon = L.divIcon({
    html,
    className: 'location-selection-ring',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })

  return selectionRingIcon
}

const clusterIconCache = new Map()

/** Builds a Leaflet divIcon for a cluster bubble showing `count` — cached per
 *  count, same pattern as createCategoryDivIcon above. */
export function createClusterDivIcon(count) {
  if (clusterIconCache.has(count)) return clusterIconCache.get(count)

  const size = count < 10 ? 36 : count < 25 ? 44 : 52
  const fontSize = count < 10 ? 13 : 15

  const html = renderToStaticMarkup(
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#102A43',
        border: '3px solid #FAFAF8',
        boxShadow: '0 2px 6px rgba(16,42,67,0.35)',
        color: '#FAFAF8',
        fontWeight: 700,
        fontSize,
      }}
    >
      {count}
    </span>
  )

  const divIcon = L.divIcon({
    html,
    className: 'location-cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })

  clusterIconCache.set(count, divIcon)
  return divIcon
}

let userLocationIcon = null

/** A single, never-varying "you are here" marker icon — built once and reused. */
export function createUserLocationDivIcon() {
  if (userLocationIcon) return userLocationIcon

  const html = renderToStaticMarkup(
    <span
      style={{
        display: 'block',
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: '#2D6E92',
        border: '3px solid #FAFAF8',
        boxShadow: '0 0 0 4px rgba(45,110,146,0.25), 0 2px 6px rgba(16,42,67,0.35)',
      }}
    />
  )

  userLocationIcon = L.divIcon({
    html,
    className: 'user-location-icon',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })

  return userLocationIcon
}
