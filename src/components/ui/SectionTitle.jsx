import Reveal from './Reveal'

const SectionTitle = ({ eyebrow, title, description, align = 'center', theme = 'light' }) => {
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
      <h2 className={`text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-balance ${headingColor}`}>
        {title}
      </h2>
      {description ? (
        <p className={`text-base sm:text-lg leading-relaxed text-balance ${descriptionColor}`}>
          {description}
        </p>
      ) : null}
    </Reveal>
  )
}

export default SectionTitle
