import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import { getLocationCategory } from '../../lib/locationCategories'

const iconCache = new Map()

/** Builds a Leaflet divIcon (colored pin + category icon) — cached per category+state. */
export function createCategoryDivIcon(categoryValue, { active = false } = {}) {
  const cacheKey = `${categoryValue}:${active}`
  if (iconCache.has(cacheKey)) return iconCache.get(cacheKey)

  const { icon: Icon, color } = getLocationCategory(categoryValue)
  const size = active ? 40 : 32
  const iconSize = active ? 18 : 15

  const html = renderToStaticMarkup(
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        border: '2px solid #FAFAF8',
        boxShadow: '0 2px 6px rgba(16,42,67,0.35)',
        transform: active ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <Icon size={iconSize} color="#FAFAF8" strokeWidth={2} />
    </span>
  )

  const divIcon = L.divIcon({
    html,
    className: 'location-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })

  iconCache.set(cacheKey, divIcon)
  return divIcon
}
