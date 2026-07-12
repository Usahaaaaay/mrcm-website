import { NavLink } from 'react-router-dom'
import { LogOut, Mountain, X } from 'lucide-react'
import { adminNavGroups } from '../lib/navigation'
import { useAuth } from '../hooks/useAuth'

const Sidebar = ({ open, onClose }) => {
  const { user, signOut } = useAuth()

  const content = (
    <div className="flex h-full flex-col bg-navy text-alpine">
      <div className="flex items-center justify-between gap-2 px-6 py-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-alpine/10 text-turquoise">
            <Mountain size={18} strokeWidth={1.75} />
          </span>
          <span className="font-display text-sm font-bold tracking-tight">
            MRC<span className="text-turquoise">Malubay</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-full p-1.5 text-alpine/70 hover:text-alpine lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-3" aria-label="Admin">
        {adminNavGroups.map((group) => (
          <div key={group.label}>
            <p className="px-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-alpine/35">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(({ label, href, icon: Icon, end }) => (
                <NavLink
                  key={href}
                  to={href}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-alpine/10 text-turquoise'
                        : 'text-alpine/70 hover:bg-alpine/5 hover:text-alpine'
                    }`
                  }
                >
                  <Icon size={17} strokeWidth={1.75} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-alpine/10 px-6 py-5">
        <p className="truncate text-xs text-alpine/50">{user?.email}</p>
        <button
          type="button"
          onClick={signOut}
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-alpine/80 hover:text-turquoise"
        >
          <LogOut size={15} strokeWidth={1.75} />
          Log out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">{content}</aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu backdrop"
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative z-10 h-full w-64">{content}</div>
        </div>
      ) : null}
    </>
  )
}

export default Sidebar
