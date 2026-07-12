import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Tag, Pencil, Trash2 } from 'lucide-react'
import { useCategories, deleteCategory } from '../hooks/useCategories'
import { usePagination } from '../hooks/usePagination'
import { useToast } from '../hooks/useToast'
import DataTable from '../components/DataTable'
import SearchInput from '../components/SearchInput'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import CategoryFormModal from '../components/CategoryFormModal'
import Button from '../../components/ui/Button'
import { CategoryIcon } from '../../lib/categoryIcons'

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const { page, setPage, from, to, totalPages } = usePagination(10)
  const { rows, count, loading, reload } = useCategories({ search, from, to })
  const toast = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setEditing(null)
      setFormOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    setPage(1)
  }, [search, setPage])

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteCategory(deleting.id)
      toast.success('Category deleted.')
      setDeleting(null)
      reload()
    } catch (err) {
      toast.error(err.message ?? 'Could not delete category.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Category',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${row.color}1A`, color: row.color }}
          >
            <CategoryIcon name={row.icon} size={16} strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-medium text-navy">{row.name}</p>
            <p className="text-xs text-slate/70">{row.description || '—'}</p>
          </div>
        </div>
      ),
    },
    { key: 'slug', label: 'Slug', render: (row) => <code className="text-xs text-slate">{row.slug}</code> },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing(row)
              setFormOpen(true)
            }}
            aria-label={`Edit ${row.name}`}
            className="rounded-full p-2 text-slate hover:bg-lake-50 hover:text-lake"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDeleting(row)}
            aria-label={`Delete ${row.name}`}
            className="rounded-full p-2 text-slate hover:bg-red-50 hover:text-red-600"
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
          <h1 className="text-2xl font-semibold text-navy">Categories</h1>
          <p className="mt-1 text-sm text-slate">Reusable across Blog, Portfolio, and Gallery.</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          New Category
        </Button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search categories…" className="max-w-sm" />

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyIcon={Tag}
        emptyTitle="No categories yet"
        emptyDescription="Create your first category to start organizing content."
        emptyAction={
          <Button
            icon={Plus}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            New Category
          </Button>
        }
      />

      <Pagination page={page} totalPages={totalPages(count)} onPageChange={setPage} />

      <CategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        category={editing}
        onSaved={reload}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete category"
        description={`"${deleting?.name}" will be removed. Content using this category will keep its data but lose the category link.`}
      />
    </div>
  )
}

export default Categories
