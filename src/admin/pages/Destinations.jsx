import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, MapPin, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { useAdminDestinations } from '../hooks/useDestinations'
import { deleteDestination } from '../../services/destinationService'
import { usePagination } from '../hooks/usePagination'
import { useToast } from '../hooks/useToast'
import { getLocationCategory, getGroupedLocationCategories } from '../../lib/locationCategories'
import DataTable from '../components/DataTable'
import SearchInput from '../components/SearchInput'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import DestinationFormModal from '../components/DestinationFormModal'
import Button from '../../components/ui/Button'

const groupedCategories = getGroupedLocationCategories()

const Destinations = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const { page, setPage, from, to, totalPages } = usePagination(10)
  const { rows, count, loading, reload } = useAdminDestinations({ search, category, from, to })
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
  }, [search, category, setPage])

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteDestination(deleting.id)
      toast.success('Destination deleted.')
      setDeleting(null)
      reload()
    } catch (err) {
      toast.error(err.message ?? 'Could not delete this destination.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Destination',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-cloud">
            {row.image_url ? <img src={row.image_url} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-navy">{row.name}</p>
            <div className="mt-0.5 flex flex-wrap gap-1">
              {row.categories.map((value) => {
                const cat = getLocationCategory(value)
                const Icon = cat.icon
                return (
                  <span
                    key={value}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-snow"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Icon size={10} />
                    {cat.label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      ),
    },
    { key: 'address', label: 'Address', render: (row) => row.address ?? '—' },
    {
      key: 'experiences',
      label: 'Experiences',
      render: (row) => `${row.experiences.length} experience${row.experiences.length === 1 ? '' : 's'}`,
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
          <h1 className="text-2xl font-semibold text-navy">Destinations</h1>
          <p className="mt-1 text-sm text-slate">{count} destination{count === 1 ? '' : 's'} on the Tekapo Guide</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          Add Destination
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search destinations…" className="max-w-xs" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full border border-navy/12 bg-snow px-4 py-2.5 text-sm text-navy focus:border-lake focus:outline-none"
        >
          <option value="all">All categories</option>
          {groupedCategories.map(({ group, categories }) => (
            <optgroup key={group} label={group}>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyIcon={MapPin}
        emptyTitle="No destinations yet"
        emptyDescription="Add your first destination to start building the Tekapo Guide."
        emptyAction={
          <Button
            icon={Plus}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            Add Destination
          </Button>
        }
      />

      <Pagination page={page} totalPages={totalPages(count)} onPageChange={setPage} />

      <DestinationFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        destination={editing}
        onSaved={reload}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete destination"
        description={`"${deleting?.name}" and all of its experiences will be permanently removed from the Tekapo Guide.`}
      />
    </div>
  )
}

export default Destinations
