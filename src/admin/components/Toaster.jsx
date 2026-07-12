import { Toaster as SonnerToaster } from 'sonner'

const AdminToaster = () => (
  <SonnerToaster
    position="top-right"
    toastOptions={{
      className: 'font-body',
      style: {
        background: '#FFFFFF',
        color: '#102A43',
        border: '1px solid rgba(16,42,67,0.08)',
        borderRadius: '1rem',
        boxShadow: '0 8px 16px rgba(16,42,67,0.06), 0 24px 48px -12px rgba(16,42,67,0.16)',
        fontSize: '0.875rem',
      },
    }}
  />
)

export default AdminToaster
