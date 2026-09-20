import { forwardRef } from 'react'

// Little Lantern's own button: same shape/API as src/components/ui/Button.jsx,
// but with lantern-* colors instead of the lake/navy ones baked into that
// component's variants — kept as a separate file rather than parameterizing
// Button itself, so the shared MRCMalubay primitive stays untouched.
const variants = {
  // hover:shadow-* is one combined value (lift elevation + a soft warm glow)
  // rather than two separate shadow utilities, since box-shadow can't layer
  // that way — kept to the primary CTA only, not every button/card.
  primary:
    'bg-lantern-glow text-lantern-dusk hover:bg-lantern-ember shadow-soft hover:shadow-[0_8px_16px_rgba(43,33,64,0.12),0_0_28px_-6px_rgba(244,166,74,0.55)]',
  // For use on light (lantern-paper) surfaces.
  secondary:
    'bg-transparent text-lantern-ink border border-lantern-ink/15 hover:border-lantern-ember hover:text-lantern-ember',
  // For use on dark (lantern-dusk) surfaces, e.g. the StudioHome hero.
  onDark:
    'bg-transparent text-lantern-paper border border-lantern-paper/20 hover:border-lantern-glow hover:text-lantern-glow',
}

const StudioButton = forwardRef(function StudioButton(
  { as = 'button', variant = 'primary', className = '', children, icon: Icon, ...props },
  ref
) {
  const Component = as
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lantern-glow'

  return (
    <Component ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
      {Icon ? <Icon size={16} strokeWidth={2} aria-hidden="true" /> : null}
    </Component>
  )
})

export default StudioButton
