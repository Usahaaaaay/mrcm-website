const Card = ({ as = 'div', className = '', hover = false, children, ...props }) => {
  const Component = as
  const hoverClasses = hover
    ? 'transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lift hover:border-lake/20'
    : ''

  return (
    <Component
      className={`rounded-3xl border border-navy/8 bg-snow shadow-soft ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Card
