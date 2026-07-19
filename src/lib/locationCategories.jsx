import {
  Toilet,
  CircleParking,
  Footprints,
  Star,
  Camera,
  Coffee,
  Fuel,
  BatteryCharging,
  Hammer,
  ShoppingCart,
  Truck,
  UtensilsCrossed,
  Gift,
  Flame,
  Shield,
  House,
  Compass,
  MapPin,
} from 'lucide-react'

/**
 * The reusable location-category system — the single source of truth for every
 * category used across the guide, the admin form, markers, cards, popups, and
 * badges. New categories are added here — one entry, no migration needed, since
 * `locations.category` is stored as free text. Keep `value` stable once
 * locations reference it; `label`/`icon`/`color`/`group` are safe to tweak any
 * time. `group` only affects display order/grouping (guide filters, admin
 * dropdown) — it has no bearing on filtering/search logic.
 */
export const LOCATION_CATEGORIES = [
  // Visitor Essentials
  { value: 'public-toilet', label: 'Public Toilet', icon: Toilet, color: '#4E5B61', group: 'Visitor Essentials' },
  { value: 'parking', label: 'Parking', icon: CircleParking, color: '#102A43', group: 'Visitor Essentials' },
  { value: 'petrol-station', label: 'Petrol Station', icon: Fuel, color: '#2D6E92', group: 'Visitor Essentials' },
  { value: 'supermarket', label: 'Supermarket', icon: ShoppingCart, color: '#2F855A', group: 'Visitor Essentials' },
  { value: 'hardware-shop', label: 'Hardware Shop', icon: Hammer, color: '#69B7C8', group: 'Visitor Essentials' },

  // Food & Drink
  { value: 'cafe', label: 'Cafe', icon: Coffee, color: '#B5654A', group: 'Food & Drink' },
  { value: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed, color: '#97266D', group: 'Food & Drink' },
  { value: 'food-trailer', label: 'Food Trailer', icon: Truck, color: '#DD6B20', group: 'Food & Drink' },

  // Attractions
  { value: 'stargazing', label: 'Stargazing', icon: Star, color: '#8A6FB0', group: 'Attractions' },
  { value: 'photography-spot', label: 'Photography Spot', icon: Camera, color: '#C8A85A', group: 'Attractions' },
  { value: 'walking-track', label: 'Walking Track', icon: Footprints, color: '#7C9070', group: 'Attractions' },
  { value: 'activities', label: 'Activities', icon: Compass, color: '#B7791F', group: 'Attractions' },

  // Community & Safety
  { value: 'ev-charging-station', label: 'EV Charging Station', icon: BatteryCharging, color: '#22C55E', group: 'Community & Safety' },
  { value: 'fire-station', label: 'Fire Station', icon: Flame, color: '#C53030', group: 'Community & Safety' },
  { value: 'police-station', label: 'Police Station', icon: Shield, color: '#2B6CB0', group: 'Community & Safety' },
  { value: 'evacuation-spot', label: 'Evacuation Spot', icon: House, color: '#319795', group: 'Community & Safety' },

  // Shopping
  { value: 'souvenir-shop', label: 'Souvenir Shop', icon: Gift, color: '#D53F8C', group: 'Shopping' },
]

// Defines the display order of groups on the guide filters + admin dropdown.
// Any category whose `group` isn't listed here still works everywhere (search,
// markers, badges, validation) — it just lands in a trailing "More" group
// instead of being silently dropped, so future additions can't fall through.
const GROUP_ORDER = ['Visitor Essentials', 'Food & Drink', 'Attractions', 'Community & Safety', 'Shopping']
const FALLBACK_GROUP = 'More'

const FALLBACK_CATEGORY = { value: 'other', label: 'Other', icon: MapPin, color: '#4E5B61', group: FALLBACK_GROUP }

export function getLocationCategory(value) {
  return LOCATION_CATEGORIES.find((category) => category.value === value) ?? FALLBACK_CATEGORY
}

/** Groups LOCATION_CATEGORIES for display (guide filters, admin dropdown) — data stays centralized. */
export function getGroupedLocationCategories() {
  const order = [...GROUP_ORDER, ...new Set(LOCATION_CATEGORIES.map((c) => c.group).filter((g) => !GROUP_ORDER.includes(g)))]

  return order
    .map((group) => ({
      group,
      categories: LOCATION_CATEGORIES.filter((category) => (category.group ?? FALLBACK_GROUP) === group),
    }))
    .filter((entry) => entry.categories.length > 0)
}

export const LocationCategoryIcon = ({ value, ...props }) => {
  const { icon: Icon } = getLocationCategory(value)
  return <Icon {...props} />
}
