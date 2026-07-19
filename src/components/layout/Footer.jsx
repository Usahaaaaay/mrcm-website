import { Link } from 'react-router-dom'
import { visibleNavLinks } from '../../data/navigation'
import { socialLinks } from '../../data/social'

const Footer = () => (
  <footer className="border-t border-navy/8 bg-navy text-alpine/70">
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-14 sm:px-10">
      <Link to="/" className="font-display text-lg font-bold tracking-tight text-alpine">
        MRC<span className="text-turquoise">Malubay</span>
      </Link>

      <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
        {visibleNavLinks.map((link) => (
          <li key={link.href}>
            <Link to={link.href} className="transition-colors hover:text-turquoise">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <ul className="flex items-center gap-5">
        {socialLinks.map(({ label, href, icon: Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-alpine/15 transition-all duration-300 hover:-translate-y-0.5 hover:border-turquoise hover:text-turquoise"
            >
              <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>

      <div className="h-px w-full max-w-xs bg-alpine/10" />

      <p className="text-center font-display text-sm italic text-alpine/50">
        &ldquo;Building things with purpose.&rdquo;
      </p>

      <p className="text-xs text-alpine/40">© 2026 MRCMalubay. All rights reserved.</p>
    </div>
  </footer>
)

export default Footer
