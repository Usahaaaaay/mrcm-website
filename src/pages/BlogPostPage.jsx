import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { generateHTML } from '@tiptap/core'
import DOMPurify from 'dompurify'
import { ArrowLeft, Calendar, Clock, BookOpen, SearchX } from 'lucide-react'
import { usePublishedPost } from '../hooks/useBlogPost'
import { buildExtensions } from '../admin/components/RichTextEditor/extensions'
import { formatDate } from '../lib/formatDate'
import Reveal from '../components/ui/Reveal'
import ImagePlaceholder from '../components/ui/ImagePlaceholder'
import Button from '../components/ui/Button'

const renderContentHtml = (content) => {
  if (!content) return ''
  try {
    return DOMPurify.sanitize(generateHTML(content, buildExtensions()))
  } catch {
    // Malformed/unexpected content shape — fail safely into an empty body
    // rather than crashing the whole page.
    return ''
  }
}

const BlogPostSkeleton = () => (
  <div className="mt-6 animate-pulse overflow-hidden rounded-3xl border border-navy/8 bg-snow shadow-soft" aria-hidden="true">
    <div className="aspect-[16/9] w-full bg-cloud" />
    <div className="flex flex-col gap-5 p-8 sm:p-10">
      <div className="h-3 w-24 rounded-full bg-cloud" />
      <div className="h-8 w-3/4 rounded-full bg-cloud" />
      <div className="h-3 w-40 rounded-full bg-cloud" />
      <div className="flex flex-col gap-3 pt-2">
        <div className="h-3 w-full rounded-full bg-cloud" />
        <div className="h-3 w-full rounded-full bg-cloud" />
        <div className="h-3 w-5/6 rounded-full bg-cloud" />
      </div>
    </div>
  </div>
)

const BlogNotFound = () => (
  <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-navy/8 bg-snow p-10 text-center shadow-soft sm:p-16">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cloud text-slate">
      <SearchX size={24} aria-hidden="true" />
    </div>
    <h1 className="font-display text-xl font-bold text-navy">Article not found</h1>
    <p className="max-w-sm text-sm text-slate">
      This post may have been unpublished, moved, or the link may be incorrect. Take a look at the rest of the
      journal instead.
    </p>
    <Button as={Link} to="/#blog" variant="primary" className="mt-2">
      Back to Blog
    </Button>
  </div>
)

const BlogPostPage = () => {
  const { slug } = useParams()
  const { post, loading, error } = usePublishedPost(slug)

  useEffect(() => {
    document.title = post ? `${post.title} — MRCMalubay` : 'MRCMalubay'
  }, [post])

  return (
    <div className="min-h-screen bg-alpine px-6 pb-24 pt-28 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/#blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-lake hover:underline"
        >
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        {loading ? (
          <BlogPostSkeleton />
        ) : error || !post ? (
          <BlogNotFound />
        ) : (
          // amount: 0 (not the Reveal default of 0.2) — this wraps the full
          // article body, whose height scales with the post's length. A
          // percentage-based threshold means long posts need a
          // proportionally large slice of the page visible before the
          // reveal fires; for sufficiently long articles even the entire
          // viewport at initial scroll position is a smaller fraction than
          // that threshold, so whileInView's condition is never met and the
          // article stays permanently at its initial opacity: 0 (confirmed:
          // a ~4400px-tall article only had ~16% visible on load, just
          // under the default 20% requirement). Triggering on any
          // visibility at all is correct regardless of content length.
          <Reveal className="mt-6" viewport={{ once: true, amount: 0 }}>
            <article className="overflow-hidden rounded-3xl border border-navy/8 bg-snow shadow-soft">
              {post.cover_media ? (
                <img
                  src={post.cover_media.url}
                  alt={post.cover_media.alt_text ?? ''}
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                <ImagePlaceholder accent="lake" icon={BookOpen} className="aspect-[16/9] w-full" iconClassName="h-14 w-14" />
              )}

              <div className="flex flex-col gap-5 p-8 sm:p-10">
                <span
                  className="w-fit text-xs font-semibold uppercase tracking-[0.15em]"
                  style={{ color: post.category?.color ?? '#2D6E92' }}
                >
                  {post.category?.name ?? 'Journal'}
                </span>

                <h1 className="font-display text-2xl font-bold text-navy sm:text-3xl">{post.title}</h1>

                <div className="flex items-center gap-4 text-xs text-slate/70">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={13} /> {formatDate(post.published_at ?? post.created_at)}
                  </span>
                  {post.reading_time_minutes > 0 ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={13} /> {post.reading_time_minutes} min read
                    </span>
                  ) : null}
                </div>

                <div
                  className="prose max-w-none prose-headings:font-display prose-headings:text-navy prose-p:text-slate prose-p:leading-relaxed prose-a:text-lake prose-strong:text-navy prose-blockquote:border-lake prose-blockquote:text-slate prose-code:text-lake prose-code:before:content-none prose-code:after:content-none"
                  dangerouslySetInnerHTML={{ __html: renderContentHtml(post.content) }}
                />
              </div>
            </article>
          </Reveal>
        )}
      </div>
    </div>
  )
}

export default BlogPostPage
