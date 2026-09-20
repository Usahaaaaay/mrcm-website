import { Outlet } from 'react-router-dom'
import StudioNavbar from '../components/studio/StudioNavbar'
import StudioFooter from '../components/studio/StudioFooter'

// Little Lantern Studios' own page chrome — never MainLayout. Every /studio/*
// route is nested under this in App.jsx, so the Little Lantern header/footer
// is the only navigation reachable once a visitor is inside /studio.
const StudioLayout = () => (
  <div className="ll-studio flex min-h-screen flex-col bg-lantern-paper text-lantern-ink">
    <StudioNavbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <StudioFooter />
  </div>
)

export default StudioLayout
