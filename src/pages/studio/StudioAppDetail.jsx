import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppWindow, ArrowLeft, ExternalLink, SearchX, Smartphone } from 'lucide-react'
import { GithubIcon } from '../../components/icons/BrandIcons'
import { useStudioApp } from '../../hooks/useStudioApp'
import Reveal from '../../components/ui/Reveal'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ImagePlaceholder from '../../components/ui/ImagePlaceholder'
import StudioButton from '../../components/studio/StudioButton'

const statusStyles = {
  Live: 'bg-lantern-glow/20 text-lantern-ember',
  'In Progress': 'bg-lantern-ember/15 text-lantern-ember',
  Planned: 'bg-lantern-ink/8 text-lantern-ink/70',
  Archived: 'bg-lantern-ink/5 text-lantern-ink/70',
}

const BackToApps = () => (
  <Link
    to="/studio/apps"
    className="inline-flex items-center gap-1.5 py-1.5 text-sm font-medium text-lantern-ember hover:underline"
  >
    <ArrowLeft size={14} /> Back to Apps
  </Link>
)

const AppSkeleton = () => (
  <div className="mt-6 animate-pulse overflow-hidden rounded-3xl border border-lantern-ink/8 bg-lantern-ink/5" aria-hidden="true">
    <div className="aspect-[16/9] w-full bg-lantern-ink/10" />
    <div className="flex flex-col gap-4 p-8 sm:p-10">
      <div className="h-5 w-24 rounded-full bg-lantern-ink/10" />
      <div className="h-8 w-2/3 rounded-full bg-lantern-ink/10" />
      <div className="h-3 w-full rounded-full bg-lantern-ink/10" />
      <div className="h-3 w-5/6 rounded-full bg-lantern-ink/10" />
    </div>
  </div>
)

const AppNotFound = () => (
  <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-lantern-ink/8 bg-lantern-paper p-10 text-center shadow-soft sm:p-16">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lantern-ink/5 text-lantern-ink/60">
      <SearchX size={24} aria-hidden="true" />
    </div>
    <h1 className="font-display text-xl font-bold text-lantern-ink">App not found</h1>
    <p className="max-w-sm text-sm text-lantern-ink/70">
      This app may have been unpublished, moved, or the link may be incorrect. Take a look at the rest of the
      workshop instead.
    </p>
    <StudioButton as={Link} to="/studio/apps" className="mt-2">
      Back to Apps
    </StudioButton>
  </div>
)

const AppLoadError = () => (
  <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-lantern-ink/8 bg-lantern-paper p-10 text-center shadow-soft sm:p-16">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lantern-ink/5 text-lantern-ink/60">
      <SearchX size={24} aria-hidden="true" />
    </div>
    <h1 className="font-display text-xl font-bold text-lantern-ink">Couldn&rsquo;t load this app</h1>
    <p className="max-w-sm text-sm text-lantern-ink/70">Something went wrong on our end — please try again shortly.</p>
    <StudioButton as={Link} to="/studio/apps" variant="secondary" className="mt-2">
      Back to Apps
    </StudioButton>
  </div>
)

const StudioAppDetail = () => {
  const { slug } = useParams()
  const { app, loading, error } = useStudioApp(slug)
  const notFound = !loading && !error && !app

  useEffect(() => {
    document.title = app ? `${app.title} — Little Lantern Studios` : 'Little Lantern Studios'
  }, [app])

  return (
    <div className="min-h-screen bg-lantern-paper px-6 pb-24 pt-16 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <BackToApps />

        {loading ? (
          <AppSkeleton />
        ) : error ? (
          <AppLoadError />
        ) : notFound ? (
          <AppNotFound />
        ) : (
          <Reveal className="mt-6">
            <Card className="overflow-hidden">
              {app.cover_media ? (
                <img
                  src={app.cover_media.url}
                  alt={app.cover_media.alt_text ?? ''}
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                <ImagePlaceholder accent="lantern" icon={AppWindow} className="aspect-[16/9] w-full" iconClassName="h-16 w-16" />
              )}

              <div className="flex flex-col gap-5 p-8 sm:p-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="min-w-0 font-display text-2xl font-bold text-lantern-ink sm:text-3xl">{app.title}</h1>
                  {app.status ? (
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusStyles[app.status] ?? statusStyles.Planned}`}>
                      {app.status}
                    </span>
                  ) : null}
                </div>

                {app.tagline ? <p className="text-base font-medium text-lantern-ember">{app.tagline}</p> : null}

                {app.description ? (
                  <p className="text-base leading-relaxed text-lantern-ink/70">{app.description}</p>
                ) : null}

                {app.tech_stack?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {app.tech_stack.map((tech) => (
                      <Badge key={tech}>{tech}</Badge>
                    ))}
                  </div>
                ) : null}

                {app.demo_url || app.app_store_url || app.github_url ? (
                  <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-lantern-ink/8 pt-6">
                    {app.demo_url ? (
                      <StudioButton as="a" href={app.demo_url} target="_blank" rel="noreferrer noopener" icon={ExternalLink}>
                        Try it
                      </StudioButton>
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
                  </div>
                ) : null}
              </div>
            </Card>
          </Reveal>
        )}
      </div>
    </div>
  )
}

export default StudioAppDetail
