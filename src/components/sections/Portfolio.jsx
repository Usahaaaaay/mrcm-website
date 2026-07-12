import { ExternalLink, FolderGit2 } from 'lucide-react'
import { GithubIcon } from '../icons/BrandIcons'
import { usePortfolioProjects } from '../../hooks/usePortfolioProjects'
import Reveal from '../ui/Reveal'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import SectionTitle from '../ui/SectionTitle'

const statusStyles = {
  Live: 'bg-lake-50 text-lake',
  'In Progress': 'bg-gold/15 text-gold',
  Planned: 'bg-cloud text-slate',
}

const accentCycle = ['lake', 'turquoise', 'gold', 'slate', 'navy']

const Portfolio = () => {
  const { projects, loading } = usePortfolioProjects(9)

  return (
    <section id="portfolio" className="bg-cloud px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="Portfolio"
          title="Things I've built"
          description="A small, growing showcase of practical software and side projects — with plenty of room left for what's next."
        />

        {!loading && projects.length === 0 ? (
          <Reveal className="py-10 text-center text-slate">
            New projects are in the works — check back soon.
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={i * 0.1} className="h-full">
                <Card
                  hover
                  className="group flex h-full flex-col overflow-hidden hover:ring-1 hover:ring-lake/25"
                >
                  {project.cover_media ? (
                    <img
                      src={project.cover_media.url}
                      alt={project.cover_media.alt_text ?? ''}
                      loading="lazy"
                      className="aspect-[16/10] w-full object-cover"
                    />
                  ) : (
                    <ImagePlaceholder
                      accent={accentCycle[i % accentCycle.length]}
                      icon={FolderGit2}
                      className="aspect-[16/10] w-full"
                      iconClassName="h-14 w-14"
                    />
                  )}

                  <div className="flex flex-1 flex-col gap-4 p-7">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-semibold text-navy">{project.title}</h3>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusStyles[project.status]}`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <p className="flex-1 text-sm leading-relaxed text-slate">{project.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {(project.tech_stack ?? []).map((tech) => (
                        <Badge key={tech}>{tech}</Badge>
                      ))}
                    </div>

                    <div className="mt-2 flex items-center gap-4 border-t border-navy/8 pt-5">
                      {project.demo_url ? (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-lake hover:underline"
                        >
                          View Project <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate/50">
                          View Project <ExternalLink size={14} />
                        </span>
                      )}
                      {project.github_url ? (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate hover:text-navy"
                        >
                          <GithubIcon size={14} /> GitHub
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate/50">
                          <GithubIcon size={14} /> GitHub
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Portfolio
