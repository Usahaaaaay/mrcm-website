import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cloud">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-lake/30 border-t-lake" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
