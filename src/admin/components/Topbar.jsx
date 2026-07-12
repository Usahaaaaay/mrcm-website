import { Menu, ExternalLink } from 'lucide-react'
import Breadcrumbs from './Breadcrumbs'

const Topbar = ({ onOpenSidebar }) => (
  <header className="flex items-center justify-between gap-4 border-b border-navy/8 bg-alpine/80 px-6 py-4 backdrop-blur-md">
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open menu"
        className="rounded-full p-1.5 text-navy lg:hidden"
      >
        <Menu size={20} />
      </button>
      <Breadcrumbs />
    </div>

    <a
      href="/"
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate hover:text-lake"
    >
      View site <ExternalLink size={14} />
    </a>
  </header>
)

export default Topbar
