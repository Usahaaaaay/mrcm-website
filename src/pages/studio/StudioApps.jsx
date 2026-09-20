import { Link } from 'react-router-dom'
import { AppWindow, ArrowUpRight, ExternalLink, Smartphone } from 'lucide-react'
import { GithubIcon } from '../../components/icons/BrandIcons'
import { useStudioApps } from '../../hooks/useStudioApps'
import Reveal from '../../components/ui/Reveal'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ImagePlaceholder from '../../components/ui/ImagePlaceholder'
import SectionTitle from '../../components/ui/SectionTitle'
import StudioComingSoon from '../../components/studio/StudioComingSoon'

const statusStyles = {
  Live: 'bg-lantern-glow/20 text-lantern-ember',
  'In Progress': 'bg-lantern-ember/15 text-lantern-ember',
  Planned: 'bg-lantern-ink/8 text-lantern-ink/70',
  Archived: 'bg-lantern-ink/5 text-lantern-ink/70',
}

const SkeletonCard = () => (
  <div className="flex h-full animate-pulse flex-col overflow-hidden rounded-3xl border border-lantern-ink/8 bg-lantern-ink/5">
    <div className="aspect-[16/10] w-full bg-lantern-ink/10" />
    <div className="flex flex-1 flex-col gap-4 p-7">
      <div className="h-5 w-2/3 rounded-full bg-lantern-ink/10" />
      <div className="h-3 w-full rounded-full bg-lantern-ink/10" />
      <div className="h-3 w-4/5 rounded-full bg-lantern-ink/10" />
    </div>
  </div>
)

const AppCard = ({ app, delay }) => (
  <Reveal delay={delay} className="h-full">
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lift hover:ring-1 hover:ring-lantern-ember/25">
      {app.cover_media ? (
        <img
          src={app.cover_media.url}
          alt={app.cover_media.alt_text ?? ''}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover"
        />
      ) : (
        <ImagePlaceholder
          accent="lantern"
          icon={AppWindow}
          className="aspect-[16/10] w-full"
          iconClassName="h-14 w-14"
        />
      )}

      <div className="flex flex-1 flex-col gap-4 p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 text-xl font-semibold text-lantern-ink">
            <Link to={`/studio/apps/${app.slug}`} className="hover:text-lantern-ember">
              {app.title}
            </Link>
          </h2>
          {app.status ? (
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusStyles[app.status] ?? statusStyles.Planned}`}>
              {app.status}
            </span>
          ) : null}
        </div>

        {app.tagline ? <p className="text-sm font-medium text-lantern-ember">{app.tagline}</p> : null}

        {app.description ? (
          <p className="flex-1 text-sm leading-relaxed text-lantern-ink/70">{app.description}</p>
        ) : (
          <div className="flex-1" />
        )}

        {app.tech_stack?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {app.tech_stack.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-lantern-ink/8 pt-5">
          <Link
            to={`/studio/apps/${app.slug}`}
            className="inline-flex items-center gap-1.5 py-1.5 text-sm font-medium text-lantern-ink/70 hover:text-lantern-ink"
          >
            Details <ArrowUpRight size={14} />
          </Link>

          {app.demo_url || app.app_store_url || app.github_url ? (
            <>
              {app.demo_url ? (
                <a
                  href={app.demo_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 py-1.5 text-sm font-medium text-lantern-ember hover:underline"
                >
                  Try it <ExternalLink size={14} />
                </a>
              ) : null}
              {app.app_store_url ? (
                <a
                  href={app.app_store_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 py-1.5 text-sm font-medium text-lantern-ink/70 hover:text-lantern-ink"
                >
                  <Smartphone size={14} /> App Store
                </a>
              ) : null}
              {app.github_url ? (
                <a
                  href={app.github_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 py-1.5 text-sm font-medium text-lantern-ink/70 hover:text-lantern-ink"
                >
                  <GithubIcon size={14} /> GitHub
                </a>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </Card>
  </Reveal>
)

const StudioApps = () => {
  const { apps, loading, error } = useStudioApps()

  return (
    <section className="bg-lantern-paper px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="Apps"
          title="Small, finished pieces of software"
          description="The apps that made it out of the workshop — each one built for a real, if small, reason."
          titleAs="h1"
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <Reveal className="py-10 text-center text-lantern-ink/60">
            Couldn&rsquo;t load the apps right now — please try again shortly.
          </Reveal>
        ) : apps.length === 0 ? (
          <StudioComingSoon
            icon={AppWindow}
            description="Nothing published here yet — the first app is still on the workbench. Check back soon."
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {apps.map((app, i) => (
              <AppCard key={app.id} app={app} delay={i * 0.1} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default StudioApps
