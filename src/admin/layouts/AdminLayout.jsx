import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import AdminToaster from '../components/Toaster'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-cloud">
      <AdminToaster />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
