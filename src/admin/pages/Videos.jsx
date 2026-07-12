import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { Upload, Link2, Video as VideoIcon, Trash2, Play } from 'lucide-react'
import { useMedia, deleteMedia } from '../hooks/useMedia'
import { getPublicMediaUrl } from '../../lib/supabase'
import { useVideoLinks, deleteVideoLink } from '../hooks/useVideoLinks'
import { usePagination } from '../hooks/usePagination'
import { useToast } from '../hooks/useToast'
import EmptyState from '../components/EmptyState'
import { SkeletonCards } from '../components/Skeleton'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import MediaUploadModal from '../components/MediaUploadModal'
import EmbedVideoModal from '../components/EmbedVideoModal'
import Button from '../../components/ui/Button'
import { formatFileSize } from '../lib/validation'

const formatDuration = (seconds) => {
  if (!seconds) return null
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const Videos = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState('uploaded')
  const { page, setPage, from, to, totalPages } = usePagination(12)
  const uploaded = useMedia({ type: 'video', from, to })
  const embedded = useVideoLinks({ from, to })
  const toast = useToast()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [embedOpen, setEmbedOpen] = useState(false)
  const [deletingMedia, setDeletingMedia] = useState(null)
  const [deletingLink, setDeletingLink] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'upload-video') {
      setTab('uploaded')
      setUploadOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    setPage(1)
  }, [tab, setPage])

  const handleDeleteMedia = async () => {
    setDeleteLoading(true)
    try {
      await deleteMedia(deletingMedia)
      toast.success('Video deleted.')
      setDeletingMedia(null)
      uploaded.reload()
    } catch (err) {
      toast.error(err.message ?? 'Could not delete video.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteLink = async () => {
    setDeleteLoading(true)
    try {
      await deleteVideoLink(deletingLink.id)
      toast.success('Embedded video removed.')
      setDeletingLink(null)
      embedded.reload()
    } catch (err) {
      toast.error(err.message ?? 'Could not remove this video.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const active = tab === 'uploaded' ? uploaded : embedded

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Videos</h1>
          <p className="mt-1 text-sm text-slate">Uploaded files and embedded YouTube/Vimeo links.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Link2} onClick={() => setEmbedOpen(true)}>
            Embed Video
          </Button>
          <Button icon={Upload} onClick={() => setUploadOpen(true)}>
            Upload Video
          </Button>
        </div>
      </div>

      <div className="flex gap-1 rounded-full border border-navy/12 bg-snow p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab('uploaded')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'uploaded' ? 'bg-lake text-snow' : 'text-slate'
          }`}
        >
          Uploaded
        </button>
        <button
          type="button"
          onClick={() => setTab('embedded')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'embedded' ? 'bg-lake text-snow' : 'text-slate'
          }`}
        >
          Embedded
        </button>
      </div>

      {active.loading ? (
        <SkeletonCards count={8} />
      ) : active.rows.length === 0 ? (
        <EmptyState
          icon={VideoIcon}
          title={tab === 'uploaded' ? 'No uploaded videos yet' : 'No embedded videos yet'}
          description={
            tab === 'uploaded'
              ? 'Upload an MP4, MOV, or WEBM file to get started.'
              : 'Paste a YouTube or Vimeo link to embed it here.'
          }
          action={
            tab === 'uploaded' ? (
              <Button icon={Upload} onClick={() => setUploadOpen(true)}>
                Upload Video
              </Button>
            ) : (
              <Button icon={Link2} onClick={() => setEmbedOpen(true)}>
                Embed Video
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {tab === 'uploaded'
            ? uploaded.rows.map((video) => (
                <div key={video.id} className="group relative overflow-hidden rounded-2xl border border-navy/8 bg-navy shadow-soft">
                  <div className="relative aspect-video">
                    {video.thumbnail_path ? (
                      <img
                        src={getPublicMediaUrl(video.thumbnail_path)}
                        alt=""
                        className="h-full w-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-alpine/40">
                        <VideoIcon size={28} strokeWidth={1.25} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-navy/20">
                      <Play size={28} className="text-alpine" fill="currentColor" />
                    </div>
                    {video.duration ? (
                      <span className="absolute bottom-2 right-2 rounded bg-navy/80 px-1.5 py-0.5 text-xs text-alpine">
                        {formatDuration(video.duration)}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-alpine">{video.filename}</p>
                      <p className="text-xs text-alpine/50">{formatFileSize(video.file_size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeletingMedia(video)}
                      aria-label="Delete"
                      className="shrink-0 rounded-full p-2 text-alpine/60 hover:bg-red-500/20 hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            : embedded.rows.map((link) => (
                <div key={link.id} className="group relative overflow-hidden rounded-2xl border border-navy/8 bg-navy shadow-soft">
                  <div className="relative aspect-video">
                    {link.thumbnail_url ? (
                      <img src={link.thumbnail_url} alt="" className="h-full w-full object-cover opacity-80" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-alpine/40">
                        <VideoIcon size={28} strokeWidth={1.25} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-navy/20">
                      <Play size={28} className="text-alpine" fill="currentColor" />
                    </div>
                    <span className="absolute bottom-2 left-2 rounded bg-navy/80 px-1.5 py-0.5 text-xs capitalize text-alpine">
                      {link.provider}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <p className="min-w-0 truncate text-sm font-medium text-alpine">{link.title}</p>
                    <button
                      type="button"
                      onClick={() => setDeletingLink(link)}
                      aria-label="Delete"
                      className="shrink-0 rounded-full p-2 text-alpine/60 hover:bg-red-500/20 hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages(active.count)} onPageChange={setPage} />

      <MediaUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        context="general"
        onUploaded={() => uploaded.reload()}
      />

      <EmbedVideoModal open={embedOpen} onClose={() => setEmbedOpen(false)} onSaved={() => embedded.reload()} />

      <ConfirmDialog
        open={Boolean(deletingMedia)}
        onClose={() => setDeletingMedia(null)}
        onConfirm={handleDeleteMedia}
        loading={deleteLoading}
        title="Delete video"
        description={`"${deletingMedia?.filename}" will be permanently removed from storage.`}
      />

      <ConfirmDialog
        open={Boolean(deletingLink)}
        onClose={() => setDeletingLink(null)}
        onConfirm={handleDeleteLink}
        loading={deleteLoading}
        title="Remove embedded video"
        description={`"${deletingLink?.title}" will be removed from your video library.`}
      />
    </div>
  )
}

export default Videos
