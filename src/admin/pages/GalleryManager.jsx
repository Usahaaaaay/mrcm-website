import { useEffect, useState } from 'react'
import { Plus, GalleryHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useGallery, deleteGalleryItem } from '../hooks/useGallery'
import { useCategories } from '../hooks/useCategories'
import { usePagination } from '../hooks/usePagination'
import { useToast } from '../hooks/useToast'
import { SkeletonCards } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import GalleryItemModal from '../components/GalleryItemModal'
import Button from '../../components/ui/Button'

const GalleryManager = () => {
  const [categoryId, setCategoryId] = useState('all')
  const { page, setPage, from, to, totalPages } = usePagination(18)
  const { rows, count, loading, reload } = useGallery({ categoryId, from, to })
  const { rows: categories } = useCategories({ from: 0, to: 999 })
  const toast = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [categoryId, setPage])

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteGalleryItem(deleting.id)
      toast.success('Gallery item deleted.')
      setDeleting(null)
      reload()
    } catch (err) {
      toast.error(err.message ?? 'Could not delete this item.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Gallery</h1>
          <p className="mt-1 text-sm text-slate">{count} item{count === 1 ? '' : 's'}</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          Add Gallery Item
        </Button>
      </div>

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="w-fit rounded-full border border-navy/12 bg-snow px-4 py-2.5 text-sm text-navy focus:border-lake focus:outline-none"
      >
        <option value="all">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {loading ? (
        <SkeletonCards count={12} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={GalleryHorizontal}
          title="No gallery items yet"
          description="Add photos to build out your gallery."
          action={
            <Button
              icon={Plus}
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              Add Gallery Item
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {rows.map((item) => (
            <div key={item.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-navy/8 shadow-soft">
              <img src={item.media?.url} alt="" loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-navy/85 via-navy/10 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="truncate text-xs font-medium text-alpine">{item.title}</p>
                {item.category ? (
                  <span className="mt-1 w-fit rounded-full bg-alpine/15 px-2 py-0.5 text-[10px] text-alpine">
                    {item.category.name}
                  </span>
                ) : null}
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(item)
                      setFormOpen(true)
                    }}
                    aria-label="Edit"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-alpine/15 text-alpine hover:bg-alpine/25"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(item)}
                    aria-label="Delete"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-alpine hover:bg-red-500/35"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages(count)} onPageChange={setPage} />

      <GalleryItemModal open={formOpen} onClose={() => setFormOpen(false)} item={editing} onSaved={reload} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete gallery item"
        description={`"${deleting?.title}" will be removed from the gallery.`}
      />
    </div>
  )
}

export default GalleryManager
