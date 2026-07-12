import { forwardRef } from 'react'

const variants = {
  primary:
    'bg-lake text-snow hover:bg-navy shadow-soft hover:shadow-lift',
  secondary:
    'bg-transparent text-navy border border-navy/15 hover:border-lake hover:text-lake',
  ghost: 'bg-transparent text-navy hover:text-lake',
  danger: 'bg-red-600 text-snow hover:bg-red-700 shadow-soft hover:shadow-lift',
}

const Button = forwardRef(function Button(
  { as = 'button', variant = 'primary', className = '', children, icon: Icon, ...props },
  ref
) {
  const Component = as
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lake'

  return (
    <Component ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
      {Icon ? <Icon size={16} strokeWidth={2} aria-hidden="true" /> : null}
    </Component>
  )
})

export default Button
