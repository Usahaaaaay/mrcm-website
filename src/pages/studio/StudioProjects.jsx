import { ExternalLink, FolderKanban, Smartphone } from 'lucide-react'
import { GithubIcon } from '../../components/icons/BrandIcons'
import { useStudioProjects } from '../../hooks/useStudioProjects'
import { formatDate } from '../../lib/formatDate'
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

const SkeletonEntry = () => (
  <div className="flex animate-pulse flex-col gap-6 overflow-hidden rounded-3xl border border-lantern-ink/8 bg-lantern-ink/5 sm:flex-row">
    <div className="aspect-[4/3] w-full bg-lantern-ink/10 sm:aspect-square sm:w-56 sm:shrink-0" />
    <div className="flex flex-1 flex-col gap-4 p-7">
      <div className="h-5 w-1/2 rounded-full bg-lantern-ink/10" />
      <div className="h-3 w-full rounded-full bg-lantern-ink/10" />
      <div className="h-3 w-2/3 rounded-full bg-lantern-ink/10" />
    </div>
  </div>
)

// A log-entry style card — deliberately different from the Apps grid (and
// from MRCMalubay's Portfolio cards): projects here are works in progress,
// not finished products, so they read more like workbench notebook entries
// than a product showcase — a horizontal strip with a lit "in-progress"
// margin rather than a uniform tile grid.
const ProjectEntry = ({ project, delay }) => (
  <Reveal delay={delay}>
    <Card className="group relative flex flex-col overflow-hidden transition-shadow duration-300 ease-out hover:shadow-lift sm:flex-row">
      <span
        className="absolute inset-y-0 left-0 w-1.5 bg-lantern-ember/40 transition-colors duration-300 group-hover:bg-lantern-ember"
        aria-hidden="true"
      />

      {project.cover_media ? (
        <img
          src={project.cover_media.url}
          alt={project.cover_media.alt_text ?? ''}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover sm:aspect-square sm:w-56 sm:shrink-0"
        />
      ) : (
        <ImagePlaceholder
          accent="lantern"
          icon={FolderKanban}
          className="aspect-[4/3] w-full sm:aspect-square sm:w-56 sm:shrink-0"
          iconClassName="h-12 w-12"
        />
      )}

      <div className="flex flex-1 flex-col gap-3 p-7">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="min-w-0 text-xl font-semibold text-lantern-ink">{project.title}</h2>
          {project.status ? (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[project.status] ?? statusStyles.Planned}`}>
              {project.status}
            </span>
          ) : null}
        </div>

        {project.tagline ? <p className="text-sm font-medium text-lantern-ember">{project.tagline}</p> : null}

        {project.description ? (
          <p className="text-sm leading-relaxed text-lantern-ink/70">{project.description}</p>
        ) : null}

        {project.tech_stack?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {project.tech_stack.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
          <p className="py-1.5 text-xs text-lantern-ink/70">Started {formatDate(project.created_at)}</p>

          {project.demo_url || project.app_store_url || project.github_url ? (
            <div className="flex flex-wrap items-center gap-4">
              {project.demo_url ? (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 py-1.5 text-sm font-medium text-lantern-ember hover:underline"
                >
                  Take a look <ExternalLink size={14} />
                </a>
              ) : null}
              {project.app_store_url ? (
                <a
                  href={project.app_store_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 py-1.5 text-sm font-medium text-lantern-ink/70 hover:text-lantern-ink"
                >
                  <Smartphone size={14} /> App Store
                </a>
              ) : null}
              {project.github_url ? (
                <a
                  href={project.github_url}
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
      </div>
    </Card>
  </Reveal>
)

const StudioProjects = () => {
  const { projects, loading, error } = useStudioProjects()

  return (
    <section className="bg-lantern-paper px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <SectionTitle
          eyebrow="Projects"
          title="Works in progress and odds and ends"
          description="The experiments, prototypes, and side quests still taking shape — not every idea needs to be finished to be worth sharing."
          titleAs="h1"
        />

        {loading ? (
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonEntry key={i} />
            ))}
          </div>
        ) : error ? (
          <Reveal className="py-10 text-center text-lantern-ink/60">
            Couldn&rsquo;t load the projects right now — please try again shortly.
          </Reveal>
        ) : projects.length === 0 ? (
          <StudioComingSoon
            icon={FolderKanban}
            description="Nothing published here yet — the first project is still taking shape. Check back soon."
          />
        ) : (
          <div className="flex flex-col gap-6">
            {projects.map((project, i) => (
              <ProjectEntry key={project.id} project={project} delay={i * 0.08} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default StudioProjects
