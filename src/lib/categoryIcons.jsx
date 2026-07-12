import {
  Camera,
  Mountain,
  Code2,
  MapPin,
  BookOpen,
  Leaf,
  Cpu,
  Compass,
  Sparkles,
  Tag,
  Image,
  Video,
  Star,
} from 'lucide-react'

export const CATEGORY_ICONS = {
  camera: Camera,
  mountain: Mountain,
  code: Code2,
  'map-pin': MapPin,
  'book-open': BookOpen,
  leaf: Leaf,
  cpu: Cpu,
  compass: Compass,
  sparkles: Sparkles,
  tag: Tag,
  image: Image,
  video: Video,
  star: Star,
}

export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICONS)

export const CategoryIcon = ({ name, ...props }) => {
  const Icon = CATEGORY_ICONS[name] ?? Tag
  return <Icon {...props} />
}

export const CATEGORY_COLOR_SWATCHES = [
  '#2D6E92', // lake
  '#69B7C8', // turquoise
  '#C8A85A', // gold
  '#4E5B61', // slate
  '#102A43', // navy
  '#7C9070', // sage
  '#B5654A', // clay
  '#8A6FB0', // muted violet
]
