import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Clock, BookOpen } from 'lucide-react'
import { usePublishedPosts } from '../../hooks/usePublishedPosts'
import { formatDate } from '../../lib/formatDate'
import Reveal from '../ui/Reveal'
import Card from '../ui/Card'
import Button from '../ui/Button'
import ImagePlaceholder from '../ui/ImagePlaceholder'
import SectionTitle from '../ui/SectionTitle'

const accentCycle = ['lake', 'turquoise', 'gold', 'slate', 'navy']

const Blog = () => {
  const { posts, loading, error } = usePublishedPosts(3)

  return (
    <section id="blog" className="bg-alpine px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="Blog"
          title="Words worth sharing"
          description="Reflections on building software, chasing good light, and everything in between."
        />

        {!loading && error ? (
          <Reveal className="py-10 text-center text-slate">
            Couldn&rsquo;t load articles right now — please try again shortly.
          </Reveal>
        ) : !loading && posts.length === 0 ? (
          <Reveal className="py-10 text-center text-slate">
            New stories are on their way — check back soon.
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.1} className="h-full">
                <Card as="article" hover className="flex h-full flex-col overflow-hidden">
                  {post.cover_media ? (
                    <img
                      src={post.cover_media.url}
                      alt={post.cover_media.alt_text ?? ''}
                      loading="lazy"
                      className="aspect-[16/10] w-full object-cover"
                    />
                  ) : (
                    <ImagePlaceholder
                      accent={accentCycle[i % accentCycle.length]}
                      icon={BookOpen}
                      className="aspect-[16/10] w-full"
                      iconClassName="h-12 w-12"
                    />
                  )}

                  <div className="flex flex-1 flex-col gap-4 p-7">
                    <span
                      className="text-xs font-semibold uppercase tracking-[0.15em]"
                      style={{ color: post.category?.color ?? '#2D6E92' }}
                    >
                      {post.category?.name ?? 'Journal'}
                    </span>

                    <h3 className="text-lg font-semibold leading-snug text-navy">{post.title}</h3>

                    <p className="flex-1 text-sm leading-relaxed text-slate">{post.excerpt}</p>

                    <div className="flex items-center gap-4 text-xs text-slate/70">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={13} /> {formatDate(post.published_at ?? post.created_at)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={13} /> {post.reading_time_minutes} min read
                      </span>
                    </div>

                    <Link
                      to={`/blog/${post.slug}`}
                      className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-lake transition-transform hover:gap-2.5"
                    >
                      Read More <ArrowRight size={14} />
                    </Link>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal className="mt-14 flex justify-center">
          <Button as="a" href="#blog" variant="secondary" icon={ArrowRight}>
            View All Articles
          </Button>
        </Reveal>
      </div>
    </section>
  )
}

export default Blog
