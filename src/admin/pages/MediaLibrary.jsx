import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { Upload, Image as ImageIcon, LayoutGrid, List, Trash2, Tag, Pencil, Video } from 'lucide-react'
import { useMedia, deleteMedia, bulkDeleteMedia, bulkAssignCategory } from '../hooks/useMedia'
import { useCategories } from '../hooks/useCategories'
import { usePagination } from '../hooks/usePagination'
import { useToast } from '../hooks/useToast'
import DataTable from '../components/DataTable'
import { SkeletonCards } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import SearchInput from '../components/SearchInput'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import MediaUploadModal from '../components/MediaUploadModal'
import MediaEditModal from '../components/MediaEditModal'
import MediaCard from '../components/MediaCard'
import CategorySelect from '../components/CategorySelect'
import Button from '../../components/ui/Button'
import { formatFileSize } from '../lib/validation'
import { getErrorMessage, logDevError } from '../lib/errors'

const MediaLibrary = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [categoryId, setCategoryId] = useState('all')
  const [sort, setSort] = useState('newest')
  const { page, setPage, from, to, totalPages } = usePagination(view === 'grid' ? 18 : 10)
  const { rows, count, loading, reload } = useMedia({ search, type, categoryId, sort, from, to })
  const { rows: categories } = useCategories({ from: 0, to: 999 })
  const toast = useToast()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selected, setSelected] = useState([])
  const [bulkCategory, setBulkCategory] = useState(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('action') === 'upload-image') {
      setUploadOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    setPage(1)
    setSelected([])
  }, [search, type, categoryId, sort, view, setPage])

  const toggleSelect = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteMedia(deleting)
      toast.success('Media deleted.')
      setDeleting(null)
      reload()
    } catch (err) {
      logDevError('deleteMedia', err)
      toast.error(getErrorMessage(err, 'Could not delete media.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    setBulkDeleteLoading(true)
    try {
      await bulkDeleteMedia(rows.filter((row) => selected.includes(row.id)))
      toast.success(`Deleted ${selected.length} item${selected.length > 1 ? 's' : ''}.`)
      setSelected([])
      setBulkDeleteOpen(false)
      reload()
    } catch (err) {
      logDevError('bulkDeleteMedia', err)
      toast.error(getErrorMessage(err, 'Could not delete selected media.'))
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  const handleBulkCategory = async (value) => {
    setBulkCategory(value)
    try {
      await bulkAssignCategory(selected, value)
      toast.success('Category updated for selected items.')
      reload()
    } catch (err) {
      logDevError('bulkAssignCategory', err)
      toast.error(getErrorMessage(err, 'Could not update category.'))
    }
  }

  const columns = [
    {
      key: 'preview',
      label: '',
      render: (row) => (
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-cloud">
          {row.type === 'video' ? (
            <Video size={18} className="text-slate" />
          ) : (
            <img src={row.url} alt="" loading="lazy" className="h-full w-full object-cover" />
          )}
        </div>
      ),
    },
    { key: 'filename', label: 'Filename' },
    { key: 'type', label: 'Type', render: (row) => <span className="capitalize">{row.type}</span> },
    { key: 'category', label: 'Category', render: (row) => row.category?.name ?? '—' },
    { key: 'file_size', label: 'Size', render: (row) => formatFileSize(row.file_size) },
    { key: 'created_at', label: 'Uploaded', render: (row) => format(new Date(row.created_at), 'MMM d, yyyy') },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(row)}
            className="rounded-full p-2 text-slate hover:bg-lake-50 hover:text-lake"
            aria-label="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDeleting(row)}
            className="rounded-full p-2 text-slate hover:bg-red-50 hover:text-red-600"
            aria-label="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Media Library</h1>
          <p className="mt-1 text-sm text-slate">{count} item{count === 1 ? '' : 's'}</p>
        </div>
        <Button icon={Upload} onClick={() => setUploadOpen(true)}>
          Upload Media
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search filenames…" className="max-w-xs" />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-full border border-navy/12 bg-snow px-4 py-2.5 text-sm text-navy focus:border-lake focus:outline-none"
        >
          <option value="all">All types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-full border border-navy/12 bg-snow px-4 py-2.5 text-sm text-navy focus:border-lake focus:outline-none"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-full border border-navy/12 bg-snow px-4 py-2.5 text-sm text-navy focus:border-lake focus:outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Filename A–Z</option>
          <option value="size">Largest first</option>
        </select>

        <div className="ml-auto flex gap-1 rounded-full border border-navy/12 bg-snow p-1">
          <button
            type="button"
            onClick={() => setView('grid')}
            aria-label="Grid view"
            className={`rounded-full p-2 ${view === 'grid' ? 'bg-lake text-snow' : 'text-slate'}`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            aria-label="List view"
            className={`rounded-full p-2 ${view === 'list' ? 'bg-lake text-snow' : 'text-slate'}`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-lake/20 bg-lake-50 px-5 py-3">
          <span className="text-sm font-medium text-lake">{selected.length} selected</span>
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-lake" />
            <CategorySelect value={bulkCategory} onChange={handleBulkCategory} />
          </div>
          <Button variant="danger" className="ml-auto" onClick={() => setBulkDeleteOpen(true)}>
            Delete Selected
          </Button>
        </div>
      ) : null}

      {loading ? (
        view === 'grid' ? (
          <SkeletonCards count={12} />
        ) : (
          <DataTable columns={columns} rows={[]} loading />
        )
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No media yet"
          description="Upload images or videos to start building your library."
          action={
            <Button icon={Upload} onClick={() => setUploadOpen(true)}>
              Upload Media
            </Button>
          }
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {rows.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              selected={selected.includes(media.id)}
              onToggleSelect={toggleSelect}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} rows={rows} />
      )}

      <Pagination page={page} totalPages={totalPages(count)} onPageChange={setPage} />

      <MediaUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => {
          reload()
        }}
      />

      <MediaEditModal open={Boolean(editing)} onClose={() => setEditing(null)} media={editing} onSaved={reload} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete media"
        description={`"${deleting?.filename}" will be permanently removed from storage.`}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={bulkDeleteLoading}
        title="Delete selected media"
        description={`${selected.length} item${selected.length > 1 ? 's' : ''} will be permanently removed from storage.`}
      />
    </div>
  )
}

export default MediaLibrary
