import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { adminNavItems } from '../lib/navigation'

const labelOverrides = {
  new: 'New',
  edit: 'Edit',
}

const Breadcrumbs = () => {
  const { pathname } = useLocation()
  const segments = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean)

  const crumbs = [{ label: 'Dashboard', href: '/admin' }]

  let accumulated = '/admin'
  segments.forEach((segment) => {
    accumulated += `/${segment}`
    const known = adminNavItems.find((item) => item.href === accumulated)
    const isId = /^[0-9a-f-]{8,}$/i.test(segment)
    const label = known?.label ?? labelOverrides[segment] ?? (isId ? null : segment)
    if (label) crumbs.push({ label, href: accumulated })
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {i > 0 ? <ChevronRight size={13} className="text-slate/40" /> : null}
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-navy">{crumb.label}</span>
          ) : (
            <Link to={crumb.href} className="hover:text-navy">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}

export default Breadcrumbs
