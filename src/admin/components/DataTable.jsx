import { SkeletonTable } from './Skeleton'
import EmptyState from './EmptyState'

const DataTable = ({
  columns,
  rows,
  keyField = 'id',
  loading = false,
  emptyIcon,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  onRowClick,
}) => {
  if (loading) {
    return (
      <div className="rounded-3xl border border-navy/8 bg-snow p-6 shadow-soft">
        <SkeletonTable cols={columns.length} />
      </div>
    )
  }

  if (!rows || rows.length === 0) {
    return (
      <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-navy/8 bg-snow shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy/8 text-xs font-semibold uppercase tracking-wide text-slate">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 font-semibold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row[keyField]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-navy/5 last:border-0 ${
                  onRowClick ? 'cursor-pointer hover:bg-cloud/60' : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 align-middle text-navy">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
