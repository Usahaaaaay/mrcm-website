import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Plus, Newspaper, Pencil, Trash2 } from 'lucide-react'
import { useBlogPosts, deleteBlogPost } from '../hooks/useBlogPosts'
import { useCategories } from '../hooks/useCategories'
import { usePagination } from '../hooks/usePagination'
import { useToast } from '../hooks/useToast'
import DataTable from '../components/DataTable'
import SearchInput from '../components/SearchInput'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import Button from '../../components/ui/Button'

const statusStyles = {
  published: 'bg-lake-50 text-lake',
  draft: 'bg-cloud text-slate',
}

const BlogList = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [categoryId, setCategoryId] = useState('all')
  const { page, setPage, from, to, totalPages } = usePagination(10)
  const { rows, count, loading, reload } = useBlogPosts({ search, status, categoryId, from, to })
  const { rows: categories } = useCategories({ from: 0, to: 999 })
  const toast = useToast()
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [search, status, categoryId, setPage])

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteBlogPost(deleting.id)
      toast.success('Post deleted.')
      setDeleting(null)
      reload()
    } catch (err) {
      toast.error(err.message ?? 'Could not delete post.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    {
      key: 'title',
      label: 'Post',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-cloud">
            {row.cover_media ? (
              <img src={row.cover_media.url} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-navy">{row.title}</p>
            <p className="truncate text-xs text-slate/70">{row.excerpt}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (row) => row.category?.name ?? '—' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[row.status]}`}>
          {row.status}
        </span>
      ),
    },
    { key: 'reading_time_minutes', label: 'Reading Time', render: (row) => `${row.reading_time_minutes} min` },
    { key: 'updated_at', label: 'Updated', render: (row) => format(new Date(row.updated_at), 'MMM d, yyyy') },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/blog/${row.id}/edit`)}
            aria-label="Edit"
            className="rounded-full p-2 text-slate hover:bg-lake-50 hover:text-lake"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDeleting(row)}
            aria-label="Delete"
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
          <h1 className="text-2xl font-semibold text-navy">Blog Posts</h1>
          <p className="mt-1 text-sm text-slate">{count} post{count === 1 ? '' : 's'}</p>
        </div>
        <Button as={Link} to="/admin/blog/new" icon={Plus}>
          New Blog
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search posts…" className="max-w-xs" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-navy/12 bg-snow px-4 py-2.5 text-sm text-navy focus:border-lake focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
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
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyIcon={Newspaper}
        emptyTitle="No blog posts yet"
        emptyDescription="Write your first post to share it with visitors."
        emptyAction={
          <Button as={Link} to="/admin/blog/new" icon={Plus}>
            New Blog
          </Button>
        }
      />

      <Pagination page={page} totalPages={totalPages(count)} onPageChange={setPage} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete post"
        description={`"${deleting?.title}" will be permanently deleted.`}
      />
    </div>
  )
}

export default BlogList
