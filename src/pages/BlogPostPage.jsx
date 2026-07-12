import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { generateHTML } from '@tiptap/core'
import DOMPurify from 'dompurify'
import { ArrowLeft, Calendar, Clock, BookOpen } from 'lucide-react'
import { usePublishedPost } from '../hooks/useBlogPost'
import { buildExtensions } from '../admin/components/RichTextEditor/extensions'
import { formatDate } from '../lib/formatDate'
import Reveal from '../components/ui/Reveal'
import ImagePlaceholder from '../components/ui/ImagePlaceholder'

const renderContentHtml = (content) => {
  if (!content) return ''
  return DOMPurify.sanitize(generateHTML(content, buildExtensions()))
}

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
          <p className="mt-8 text-sm text-slate">Loading…</p>
        ) : error || !post ? (
          <div className="mt-8 rounded-3xl border border-navy/8 bg-snow p-10 text-center shadow-soft">
            <p className="text-sm text-slate">This article couldn&rsquo;t be found.</p>
          </div>
        ) : (
          <Reveal className="mt-6">
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
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} /> {post.reading_time_minutes} min read
                  </span>
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
