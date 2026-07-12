import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const MainLayout = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-alpine">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
)

export default MainLayout
