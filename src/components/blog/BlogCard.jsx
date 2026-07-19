import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Clock, BookOpen } from 'lucide-react'
import { formatDate } from '../../lib/formatDate'
import Reveal from '../ui/Reveal'
import Card from '../ui/Card'
import ImagePlaceholder from '../ui/ImagePlaceholder'

const ACCENT_CYCLE = ['lake', 'turquoise', 'gold', 'slate', 'navy']

/**
 * A single published post preview — extracted from the old homepage Blog
 * section so the Blog listing page (src/pages/BlogListPage.jsx) can reuse
 * the exact same card markup/styling rather than duplicating it. `index`
 * only drives the placeholder accent cycle and the reveal-in stagger delay,
 * not anything about the post itself.
 */
const BlogCard = ({ post, index = 0 }) => (
  <Reveal delay={index * 0.1} className="h-full">
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
          accent={ACCENT_CYCLE[index % ACCENT_CYCLE.length]}
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
)

export default BlogCard
