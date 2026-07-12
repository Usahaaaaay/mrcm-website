import DOMPurify from 'dompurify'
import { User, MapPin, Mail, FileText, Download } from 'lucide-react'
import { useAboutPublic } from '../../hooks/useAboutPublic'
import { getSocialPlatform } from '../../lib/socialPlatforms'
import { CategoryIcon } from '../../lib/categoryIcons'
import Reveal from '../ui/Reveal'
import Card from '../ui/Card'
import SectionTitle from '../ui/SectionTitle'

// bio_content_html is pre-rendered by Tiptap at save-time in the admin editor
// (see RichTextEditor/Editor.jsx's onChange) — the public bundle never needs
// to import Tiptap itself just to display already-rendered HTML.
const renderBioHtml = (html) => (html ? DOMPurify.sanitize(html) : '')

const About = () => {
  const { about, skills, technologies, socialLinks, statistics, interests, funFacts, timeline, loading } =
    useAboutPublic()

  if (loading || !about) return null

  const visibleSocialLinks = socialLinks.filter((link) => link.visible)
  const visibleStatistics = statistics.filter((stat) => stat.visible)
  const bioHtml = renderBioHtml(about.bio_content_html)

  const currentlyItems = [
    { label: 'Building', value: about.currently_building },
    { label: 'Learning', value: about.currently_learning },
    { label: 'Reading', value: about.currently_reading },
    { label: 'Watching', value: about.currently_watching },
    { label: 'Listening To', value: about.currently_listening_to },
    { label: 'Planning', value: about.currently_planning },
  ].filter((item) => item.value)

  return (
    <section id="about" className="bg-alpine px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="About Me"
          title={about.bio_title || "A little about how I got here"}
          description={about.bio_subtitle}
        />

        <div className="grid items-start gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 lg:mx-0">
            <div className="relative aspect-square w-full">
              <div className="absolute -inset-4 rounded-full border border-turquoise/30" />
              <div className="absolute -inset-8 rounded-full border border-lake/15" />
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-lake/20 via-turquoise/15 to-cloud shadow-soft">
                {about.photo_url ? (
                  <img src={about.photo_url} alt={about.full_name ?? ''} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <User size={96} strokeWidth={1} className="text-lake/40" />
                )}
              </div>
            </div>

            <div className="text-center">
              {about.display_name ? <h3 className="font-display text-xl font-bold text-navy">{about.display_name}</h3> : null}
              {about.job_title ? <p className="text-sm text-slate">{about.job_title}</p> : null}
            </div>

            {(about.location || about.email || about.resume_url) ? (
              <div className="flex flex-col items-center gap-2 text-sm text-slate">
                {about.location ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} className="text-lake" /> {about.location}
                  </span>
                ) : null}
                {about.email ? (
                  <a href={`mailto:${about.email}`} className="inline-flex items-center gap-1.5 hover:text-lake">
                    <Mail size={14} className="text-lake" /> {about.email}
                  </a>
                ) : null}
                {about.resume_url ? (
                  <a
                    href={about.resume_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-navy/12 px-4 py-2 text-xs font-medium text-navy hover:border-lake hover:text-lake"
                  >
                    <FileText size={13} /> Resume <Download size={12} />
                  </a>
                ) : null}
              </div>
            ) : null}

            {visibleSocialLinks.length > 0 ? (
              <ul className="flex items-center gap-3">
                {visibleSocialLinks.map((link) => {
                  const meta = getSocialPlatform(link.platform)
                  const Icon = meta.icon
                  return (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={meta.label}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-navy/10 text-slate transition-colors hover:border-lake hover:text-lake"
                      >
                        <Icon size={15} />
                      </a>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col gap-6">
            {about.tagline ? <p className="text-lg font-medium text-navy">{about.tagline}</p> : null}
            {about.short_introduction ? <p className="text-lg leading-relaxed text-slate">{about.short_introduction}</p> : null}
            {bioHtml ? (
              <div
                className="prose max-w-none prose-p:text-slate prose-p:leading-relaxed prose-headings:text-navy prose-a:text-lake"
                dangerouslySetInnerHTML={{ __html: bioHtml }}
              />
            ) : null}
          </Reveal>
        </div>

        {currentlyItems.length > 0 ? (
          <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
            {currentlyItems.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy/10 bg-cloud px-4 py-2 text-xs text-slate"
              >
                <span className="font-semibold text-navy">{item.label}:</span> {item.value}
              </span>
            ))}
          </Reveal>
        ) : null}

        {visibleStatistics.length > 0 ? (
          <Reveal className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {visibleStatistics.map((stat) => (
              <Card key={stat.id} className="flex flex-col items-center gap-2 p-6 text-center">
                <CategoryIcon name={stat.icon} size={20} strokeWidth={1.75} className="text-lake" />
                <span className="text-2xl font-bold text-navy">{stat.value}</span>
                <span className="text-xs text-slate">{stat.label}</span>
              </Card>
            ))}
          </Reveal>
        ) : null}

        {skills.length > 0 || technologies.length > 0 ? (
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {skills.length > 0 ? (
              <Reveal>
                <Card className="flex h-full flex-col gap-4 p-7">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill.id} className="rounded-full bg-lake-50 px-3 py-1.5 text-sm text-lake">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </Card>
              </Reveal>
            ) : null}

            {technologies.length > 0 ? (
              <Reveal delay={0.05}>
                <Card className="flex h-full flex-col gap-4 p-7">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech) => (
                      <span
                        key={tech.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-cloud px-3 py-1.5 text-sm text-navy"
                      >
                        <CategoryIcon name={tech.icon} size={13} strokeWidth={1.75} />
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </Card>
              </Reveal>
            ) : null}
          </div>
        ) : null}

        {interests.length > 0 || funFacts.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {interests.length > 0 ? (
              <Reveal>
                <Card className="flex h-full flex-col gap-4 p-7">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <span key={interest.id} className="rounded-full border border-navy/10 px-3 py-1.5 text-sm text-slate">
                        {interest.label}
                      </span>
                    ))}
                  </div>
                </Card>
              </Reveal>
            ) : null}

            {funFacts.length > 0 ? (
              <Reveal delay={0.05}>
                <Card className="flex h-full flex-col gap-4 p-7">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate">Fun Facts</h3>
                  <ul className="flex flex-col gap-2">
                    {funFacts.map((fact) => (
                      <li key={fact.id} className="flex items-center gap-2 text-sm text-slate">
                        {fact.emoji ? <span>{fact.emoji}</span> : null}
                        {fact.text}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            ) : null}
          </div>
        ) : null}

        {timeline.length > 0 ? (
          <Reveal className="mt-16">
            <Card className="flex flex-col gap-5 p-7">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate">Timeline</h3>
              <ol className="flex flex-col gap-5">
                {timeline.map((entry) => (
                  <li key={entry.id} className="flex gap-4">
                    <span className="w-16 shrink-0 text-sm font-semibold text-lake">{entry.year}</span>
                    <div>
                      <p className="text-sm font-medium text-navy">{entry.title}</p>
                      {entry.description ? <p className="mt-0.5 text-sm text-slate">{entry.description}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </Reveal>
        ) : null}
      </div>
    </section>
  )
}

export default About
