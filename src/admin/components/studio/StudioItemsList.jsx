import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { useStudioItems, deleteStudioItem } from '../../hooks/useStudioItems'
import { usePagination } from '../../hooks/usePagination'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage, logDevError } from '../../lib/errors'
import DataTable from '../DataTable'
import SearchInput from '../SearchInput'
import Pagination from '../Pagination'
import ConfirmDialog from '../ConfirmDialog'
import Button from '../../../components/ui/Button'

const statusStyles = {
  Live: 'bg-lake-50 text-lake',
  'In Progress': 'bg-gold/15 text-gold',
  Planned: 'bg-cloud text-slate',
  Archived: 'bg-navy/5 text-slate/60',
}

/** Shared list view backing both /admin/studio/apps and /admin/studio/projects
 *  — Apps and Projects are the same studio_items table filtered by `kind`
 *  (see supabase/migrations/0009_studio_content.sql), so one implementation
 *  covers both rather than duplicating this file per kind. */
const StudioItemsList = ({ kind, basePath, titleSingular, titlePlural, emptyIcon }) => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const { page, setPage, from, to, totalPages } = usePagination(10)
  const { rows, count, loading, error, reload } = useStudioItems(kind, { search, status, from, to })
  const toast = useToast()
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [search, status, setPage])

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteStudioItem(deleting.id)
      toast.success(`${titleSingular} deleted.`)
      setDeleting(null)
      reload()
    } catch (err) {
      logDevError('StudioItemsList delete', err)
      toast.error(getErrorMessage(err, `Could not delete this ${titleSingular.toLowerCase()}.`))
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    {
      key: 'title',
      label: titleSingular,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-cloud">
            {row.cover_media ? <img src={row.cover_media.url} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-navy">{row.title}</p>
            <p className="truncate text-xs text-slate/70">{row.tagline || (row.tech_stack ?? []).join(', ')}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[row.status] ?? statusStyles.Planned}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'visible',
      label: 'Visible',
      render: (row) =>
        row.visible ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-lake">
            <Eye size={13} /> Visible
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate/60">
            <EyeOff size={13} /> Hidden
          </span>
        ),
    },
    { key: 'sort_order', label: 'Order', render: (row) => row.sort_order },
    { key: 'updated_at', label: 'Updated', render: (row) => format(new Date(row.updated_at), 'MMM d, yyyy') },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/${row.id}/edit`)}
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
          <h1 className="text-2xl font-semibold text-navy">{titlePlural}</h1>
          <p className="mt-1 text-sm text-slate">
            {count} {titleSingular.toLowerCase()}
            {count === 1 ? '' : 's'}
          </p>
        </div>
        <Button as={Link} to={`${basePath}/new`} icon={Plus}>
          New {titleSingular}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder={`Search ${titlePlural.toLowerCase()}…`} className="max-w-xs" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-navy/12 bg-snow px-4 py-2.5 text-sm text-navy focus:border-lake focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="Live">Live</option>
          <option value="In Progress">In Progress</option>
          <option value="Planned">Planned</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          {getErrorMessage(error, `Couldn't load ${titlePlural.toLowerCase()}.`)}
        </p>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyIcon={emptyIcon}
          emptyTitle={`No ${titlePlural.toLowerCase()} yet`}
          emptyDescription={`Add your first ${titleSingular.toLowerCase()} to start filling out the Little Lantern Studios ${titlePlural.toLowerCase()} page.`}
          emptyAction={
            <Button as={Link} to={`${basePath}/new`} icon={Plus}>
              New {titleSingular}
            </Button>
          }
        />
      )}

      <Pagination page={page} totalPages={totalPages(count)} onPageChange={setPage} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title={`Delete ${titleSingular.toLowerCase()}`}
        description={`"${deleting?.title}" will be permanently deleted and removed from the public Studio ${titlePlural.toLowerCase()} page.`}
      />
    </div>
  )
}

export default StudioItemsList
