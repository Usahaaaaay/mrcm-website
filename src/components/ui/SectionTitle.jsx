import Reveal from './Reveal'

// titleAs: every call site inside the homepage's single-page sections wants
// an <h2> (Hero.jsx already owns that page's one <h1>) — a standalone route
// like the Blog listing page needs its own <h1> instead, since it isn't a
// section of some other page's heading hierarchy. Defaults to 'h2' so every
// existing usage is unaffected; only pages that need it opt in.
const SectionTitle = ({ eyebrow, title, description, align = 'center', theme = 'light', titleAs: TitleTag = 'h2' }) => {
  const alignment = align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left'
  const headingColor = theme === 'dark' ? 'text-alpine' : 'text-navy'
  const descriptionColor = theme === 'dark' ? 'text-alpine/70' : 'text-slate'

  return (
    <Reveal className={`flex flex-col gap-4 ${alignment} max-w-2xl mb-16`}>
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          {eyebrow}
        </span>
      ) : null}
      <TitleTag className={`text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-balance ${headingColor}`}>
        {title}
      </TitleTag>
      {description ? (
        <p className={`text-base sm:text-lg leading-relaxed text-balance ${descriptionColor}`}>
          {description}
        </p>
      ) : null}
    </Reveal>
  )
}

export default SectionTitle
