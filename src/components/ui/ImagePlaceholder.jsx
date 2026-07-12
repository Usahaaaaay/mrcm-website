import { accentGradients } from '../../lib/accent'

const ImagePlaceholder = ({ accent = 'lake', icon: Icon, className = '', iconClassName = '' }) => (
  <div
    className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${accentGradients[accent]} ${className}`}
  >
    <div className="absolute inset-0 opacity-40 mix-blend-overlay [background-image:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_55%)]" />
    {Icon ? (
      <Icon className={`relative text-navy/25 ${iconClassName}`} strokeWidth={1.25} aria-hidden="true" />
    ) : null}
  </div>
)

export default ImagePlaceholder
