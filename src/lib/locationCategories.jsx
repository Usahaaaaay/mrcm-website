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
  Droplet,
  Barrel,
  Shirt,
  Trash2,
  Hotel,
  BedSingle,
  Waves,
  Trees,
  Dog,
  Anchor,
  Landmark,
  Mailbox,
  Tent,
  Info,
  Backpack,
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
  // Services & Essentials
  { value: 'public-toilet', label: 'Public Toilet', icon: Toilet, color: '#4E5B61', group: 'Services & Essentials' },
  { value: 'parking', label: 'Parking', icon: CircleParking, color: '#102A43', group: 'Services & Essentials' },
  { value: 'petrol-station', label: 'Petrol Station', icon: Fuel, color: '#2D6E92', group: 'Services & Essentials' },
  { value: 'supermarket', label: 'Supermarket', icon: ShoppingCart, color: '#2F855A', group: 'Services & Essentials' },
  { value: 'laundry', label: 'Laundry', icon: Shirt, color: '#5EAAA8', group: 'Services & Essentials' },
  { value: 'rubbish-bin', label: 'Rubbish Bin', icon: Trash2, color: '#6B7280', group: 'Services & Essentials' },
  { value: 'atm', label: 'ATM', icon: Landmark, color: '#1D4ED8', group: 'Services & Essentials' },
  { value: 'post-shop', label: 'Post Shop', icon: Mailbox, color: '#E11D48', group: 'Services & Essentials' },

  // Food & Drink
  { value: 'cafe', label: 'Cafe', icon: Coffee, color: '#B5654A', group: 'Food & Drink' },
  { value: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed, color: '#97266D', group: 'Food & Drink' },
  { value: 'food-trailer', label: 'Food Trailer', icon: Truck, color: '#DD6B20', group: 'Food & Drink' },

  // Accommodation
  { value: 'hotel', label: 'Hotel', icon: Hotel, color: '#4338CA', group: 'Accommodation' },
  { value: 'hostel', label: 'Hostel', icon: BedSingle, color: '#7E22CE', group: 'Accommodation' },
  { value: 'camping-holiday-park', label: 'Camping / Holiday Park', icon: Tent, color: '#166534', group: 'Accommodation' },

  // Attractions
  { value: 'stargazing', label: 'Stargazing', icon: Star, color: '#8A6FB0', group: 'Attractions' },
  { value: 'photography-spot', label: 'Photography Spot', icon: Camera, color: '#C8A85A', group: 'Attractions' },
  { value: 'walking-track', label: 'Walking Track', icon: Footprints, color: '#7C9070', group: 'Attractions' },
  { value: 'activities', label: 'Activities', icon: Compass, color: '#B7791F', group: 'Attractions' },
  { value: 'beach', label: 'Beach', icon: Waves, color: '#0D9488', group: 'Attractions' },
  { value: 'childrens-park', label: "Children's Park", icon: Trees, color: '#65A30D', group: 'Attractions' },
  { value: 'dog-park', label: 'Dog Park', icon: Dog, color: '#92400E', group: 'Attractions' },
  { value: 'boat-ramp', label: 'Boat Ramp', icon: Anchor, color: '#155E75', group: 'Attractions' },

  // Campervan Services
  { value: 'fresh-water', label: 'Fresh Water', icon: Droplet, color: '#0EA5E9', group: 'Campervan Services' },
  {
    value: 'waste-water-dump-station',
    label: 'Waste Water Dump Station',
    icon: Barrel,
    color: '#8B6F47',
    group: 'Campervan Services',
  },

  // Community & Safety
  { value: 'fire-station', label: 'Fire Station', icon: Flame, color: '#C53030', group: 'Community & Safety' },
  { value: 'police-station', label: 'Police Station', icon: Shield, color: '#2B6CB0', group: 'Community & Safety' },
  { value: 'evacuation-spot', label: 'Evacuation Spot', icon: House, color: '#319795', group: 'Community & Safety' },
  { value: 'ev-charging-station', label: 'EV Charging Station', icon: BatteryCharging, color: '#22C55E', group: 'Community & Safety' },
  {
    value: 'i-site-information-centre',
    label: 'i-SITE / Information Centre',
    icon: Info,
    color: '#475569',
    group: 'Community & Safety',
  },

  // Shopping & Services
  { value: 'souvenir-shop', label: 'Souvenir Shop', icon: Gift, color: '#D53F8C', group: 'Shopping & Services' },
  { value: 'hardware-shop', label: 'Hardware Shop', icon: Hammer, color: '#69B7C8', group: 'Shopping & Services' },
  { value: 'outdoor-sports-shop', label: 'Outdoor Sports Shop', icon: Backpack, color: '#CA8A04', group: 'Shopping & Services' },
]

// Defines the display order of groups on the guide filters + admin dropdown.
// Any category whose `group` isn't listed here still works everywhere (search,
// markers, badges, validation) — it just lands in a trailing "More" group
// instead of being silently dropped, so future additions can't fall through.
const GROUP_ORDER = [
  'Services & Essentials',
  'Food & Drink',
  'Accommodation',
  'Attractions',
  'Campervan Services',
  'Community & Safety',
  'Shopping & Services',
]
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
