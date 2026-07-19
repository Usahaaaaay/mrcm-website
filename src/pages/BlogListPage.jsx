import { useEffect } from 'react'
import { usePublishedPosts } from '../hooks/usePublishedPosts'
import BlogCard from '../components/blog/BlogCard'
import Reveal from '../components/ui/Reveal'
import SectionTitle from '../components/ui/SectionTitle'

// Copy/layout intentionally unchanged from the old homepage Blog section —
// this route replaces it, not redesigns it. `usePublishedPosts()` with no
// limit fetches every published post (see the hook), which is the whole
// point of a dedicated listing page rather than a homepage preview.
//
// Future-ready per the brief: `posts` here is the full, unfiltered list —
// category/tag filtering or a search box would filter this same array
// before mapping it into <BlogCard>s, and real pagination would add
// limit/offset params to usePublishedPosts (already shaped for it) rather
// than requiring a rewrite of this page.
const BlogListPage = () => {
  const { posts, loading, error } = usePublishedPosts()

  useEffect(() => {
    document.title = 'Blog — MRCMalubay'
  }, [])

  return (
    <div className="min-h-screen bg-alpine px-6 pb-24 pt-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          titleAs="h1"
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
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogListPage
