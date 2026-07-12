import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from '../../components/ui/Button'

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Delete',
  danger = true,
  loading = false,
}) => (
  <Modal open={open} onClose={onClose} title={title} className="max-w-sm">
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            danger ? 'bg-red-50 text-red-600' : 'bg-lake-50 text-lake'
          }`}
        >
          <AlertTriangle size={18} strokeWidth={1.75} />
        </span>
        {description ? <p className="pt-2 text-sm leading-relaxed text-slate">{description}</p> : null}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="button" onClick={onConfirm} disabled={loading} variant={danger ? 'danger' : 'primary'}>
          {loading ? 'Please wait…' : confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
)

export default ConfirmDialog
