import { Link } from 'react-router-dom'
import { AppWindow, ArrowRight, ArrowUpRight, FolderKanban, Sparkles, UserRound } from 'lucide-react'
import { useStudioApps } from '../../hooks/useStudioApps'
import Reveal from '../../components/ui/Reveal'
import Card from '../../components/ui/Card'
import ImagePlaceholder from '../../components/ui/ImagePlaceholder'
import SectionTitle from '../../components/ui/SectionTitle'
import StudioButton from '../../components/studio/StudioButton'
import StudioComingSoon from '../../components/studio/StudioComingSoon'
import StudioStars from '../../components/studio/StudioStars'
import LanternMark from '../../components/studio/LanternMark'

const statusStyles = {
  Live: 'bg-lantern-glow/20 text-lantern-ember',
  'In Progress': 'bg-lantern-ember/15 text-lantern-ember',
  Planned: 'bg-lantern-ink/8 text-lantern-ink/70',
  Archived: 'bg-lantern-ink/5 text-lantern-ink/70',
}

const whatGetsMade = [
  {
    icon: AppWindow,
    label: 'Apps',
    href: '/studio/apps',
    description: 'Small, finished pieces of software — the ones that made it out of the workshop and into daily use.',
  },
  {
    icon: FolderKanban,
    label: 'Projects',
    href: '/studio/projects',
    description: 'Works in progress, experiments, and the odds and ends still taking shape on the workbench.',
  },
]

const Hero = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-lantern-dusk via-lantern-night to-lantern-dusk px-6 py-28 sm:px-10">
    {/* Soft lantern glow — a single large, low-opacity, heavily-blurred blob.
        Purely atmospheric: no shape detail, just warmth in the corner of the
        sky, like light spilling from a window. */}
    <div
      className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-lantern-glow/10 blur-3xl"
      aria-hidden="true"
    />
    <StudioStars />

    <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
      {/* The studio's signature — a small glowing lantern, perched above the
          content. Same LanternMark as the footer signature, just larger and
          warm-lit here. In-flow (not absolutely positioned) so it can never
          overlap the heading or buttons at any viewport width. */}
      <Reveal>
        <LanternMark
          size={40}
          className="h-10 w-10 text-lantern-glow/80 drop-shadow-[0_0_10px_rgba(244,166,74,0.35)] sm:h-12 sm:w-12 lg:h-14 lg:w-14"
        />
      </Reveal>

      <Reveal className="inline-flex items-center gap-2 rounded-full border border-lantern-paper/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-lantern-glow">
        <Sparkles size={13} strokeWidth={1.75} aria-hidden="true" />
        A personal hobby workshop
      </Reveal>

      <Reveal
        delay={0.1}
        as="h1"
        className="text-balance font-display text-4xl font-semibold leading-tight text-lantern-paper sm:text-5xl md:text-6xl"
      >
        A small workshop for building apps and chasing curious ideas.
      </Reveal>

      <Reveal delay={0.2} className="text-balance max-w-xl text-base leading-relaxed text-lantern-paper/70 sm:text-lg">
        Little Lantern Studios isn&rsquo;t a company — it&rsquo;s one person&rsquo;s ongoing side project: small
        apps, half-finished experiments, and whatever idea seemed worth trying next. Made in spare time, for the
        fun of making it.
      </Reveal>

      <Reveal delay={0.3} className="mt-2 flex flex-wrap items-center justify-center gap-4">
        <StudioButton as={Link} to="/studio/apps" icon={ArrowRight}>
          Explore the apps
        </StudioButton>
        <StudioButton as={Link} to="/studio/projects" variant="onDark">
          See the projects
        </StudioButton>
      </Reveal>
    </div>
  </section>
)

const FeaturedAppSkeleton = () => (
  <div
    className="flex animate-pulse flex-col overflow-hidden rounded-3xl border border-lantern-ink/8 bg-lantern-ink/5 md:flex-row"
    aria-hidden="true"
  >
    <div className="aspect-[16/10] w-full bg-lantern-ink/10 md:aspect-auto md:w-1/2 md:self-stretch" />
    <div className="flex flex-1 flex-col justify-center gap-4 p-8 md:p-10">
      <div className="h-3 w-24 rounded-full bg-lantern-ink/10" />
      <div className="h-8 w-2/3 rounded-full bg-lantern-ink/10" />
      <div className="h-3 w-full rounded-full bg-lantern-ink/10" />
      <div className="h-3 w-4/5 rounded-full bg-lantern-ink/10" />
    </div>
  </div>
)

// The homepage's one dynamic section: whichever published app currently
// leads the Apps list (see useStudioApps.js — ordered by sort_order, then
// newest) is featured here automatically. Nothing about which app this is
// is hardcoded; swap what's published in the admin and this section follows.
const FeaturedApp = () => {
  const { apps, loading, error } = useStudioApps()
  const app = apps[0]

  return (
    <section className="bg-lantern-paper px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          eyebrow="From the workbench"
          title="Currently lit up"
          description="Whatever&rsquo;s live right now on the workbench — see what&rsquo;s made it out into the world so far."
        />

        {loading ? (
          <FeaturedAppSkeleton />
        ) : error ? (
          <Reveal className="py-10 text-center text-lantern-ink/60">
            Couldn&rsquo;t load the featured app right now — please try again shortly.
          </Reveal>
        ) : !app ? (
          <StudioComingSoon
            icon={AppWindow}
            titleAs="h3"
            description="The first app isn&rsquo;t quite ready to share yet — check back soon, or take a look at what&rsquo;s in progress on the Projects page."
          />
        ) : (
          <Reveal>
            <Card className="flex flex-col overflow-hidden md:flex-row">
              {app.cover_media ? (
                <img
                  src={app.cover_media.url}
                  alt={app.cover_media.alt_text ?? ''}
                  className="aspect-[16/10] w-full object-cover md:aspect-auto md:w-1/2 md:self-stretch"
                />
              ) : (
                <ImagePlaceholder
                  accent="lantern"
                  icon={AppWindow}
                  className="aspect-[16/10] w-full md:aspect-auto md:w-1/2 md:self-stretch"
                  iconClassName="h-16 w-16"
                />
              )}

              <div className="flex flex-1 flex-col justify-center gap-4 p-8 md:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-lantern-ember">
                    Featured App
                  </span>
                  {app.status ? (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[app.status] ?? statusStyles.Planned}`}
                    >
                      {app.status}
                    </span>
                  ) : null}
                </div>

                <h3 className="text-2xl font-semibold text-lantern-ink sm:text-3xl">{app.title}</h3>

                {app.tagline ? <p className="text-base font-medium text-lantern-ember">{app.tagline}</p> : null}

                {app.description ? (
                  <p className="text-sm leading-relaxed text-lantern-ink/70">{app.description}</p>
                ) : null}

                <StudioButton as={Link} to={`/studio/apps/${app.slug}`} icon={ArrowRight} className="mt-2 w-fit">
                  View {app.title}
                </StudioButton>
              </div>
            </Card>
          </Reveal>
        )}
      </div>
    </section>
  )
}

const WhatGetsMade = () => (
  <section className="bg-lantern-paper px-6 pb-28 pt-4 sm:px-10">
    <div className="mx-auto max-w-5xl">
      <SectionTitle
        eyebrow="What gets made here"
        title="Two shelves: finished, and still taking shape"
        description="Apps are the things that got far enough to use. Projects are everything still on the workbench — no less worth sharing."
      />

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {whatGetsMade.map(({ icon: Icon, label, href, description }, i) => (
          <Reveal key={href} delay={i * 0.1} className="h-full">
            <Card
              as={Link}
              to={href}
              className="group flex h-full flex-col gap-4 p-7 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lift hover:ring-1 hover:ring-lantern-ember/25"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-lantern-glow/15 text-lantern-ember">
                <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3 className="text-xl font-semibold text-lantern-ink">{label}</h3>
              <p className="flex-1 text-sm leading-relaxed text-lantern-ink/70">{description}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-lantern-ember">
                Take a look
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2} className="mt-14 flex justify-center">
        <Link
          to="/studio/about"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-lantern-ink/60 hover:text-lantern-ember"
        >
          <UserRound size={14} /> Curious who&rsquo;s behind the lantern? Read the About page
          <ArrowUpRight size={12} />
        </Link>
      </Reveal>
    </div>
  </section>
)

const StudioHome = () => (
  <>
    <Hero />
    <FeaturedApp />
    <WhatGetsMade />
  </>
)

export default StudioHome
