import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import ScrollManager from './components/layout/ScrollManager'
import { AuthProvider } from './admin/hooks/useAuth'
import ProtectedRoute from './admin/routes/ProtectedRoute'
import AdminLayout from './admin/layouts/AdminLayout'

const Login = lazy(() => import('./admin/pages/Login'))
const Dashboard = lazy(() => import('./admin/pages/Dashboard'))
const Categories = lazy(() => import('./admin/pages/Categories'))
const MediaLibrary = lazy(() => import('./admin/pages/MediaLibrary'))
const Videos = lazy(() => import('./admin/pages/Videos'))
const BlogList = lazy(() => import('./admin/pages/BlogList'))
const BlogEditor = lazy(() => import('./admin/pages/BlogEditor'))
const PortfolioList = lazy(() => import('./admin/pages/PortfolioList'))
const PortfolioEditor = lazy(() => import('./admin/pages/PortfolioEditor'))
const GalleryManager = lazy(() => import('./admin/pages/GalleryManager'))
const Destinations = lazy(() => import('./admin/pages/Destinations'))
const AboutEditor = lazy(() => import('./admin/pages/AboutEditor'))
const TekapoGuidePage = lazy(() => import('./pages/TekapoGuidePage'))
const TekapoJourney = lazy(() => import('./pages/TekapoJourney'))
const DestinationDetailPage = lazy(() => import('./pages/DestinationDetailPage'))
const BlogListPage = lazy(() => import('./pages/BlogListPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-cloud">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-lake/30 border-t-lake" />
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollManager />
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />

          <Route
            path="/guide"
            element={
              <MainLayout>
                <Suspense fallback={<PageFallback />}>
                  <TekapoGuidePage />
                </Suspense>
              </MainLayout>
            }
          />

          <Route
            path="/guide/:id"
            element={
              <MainLayout>
                <Suspense fallback={<PageFallback />}>
                  <DestinationDetailPage />
                </Suspense>
              </MainLayout>
            }
          />

          <Route
            path="/tekapo-journey"
            element={
              <Suspense fallback={<PageFallback />}>
                <TekapoJourney />
              </Suspense>
            }
          />

          <Route
            path="/blog"
            element={
              <MainLayout>
                <Suspense fallback={<PageFallback />}>
                  <BlogListPage />
                </Suspense>
              </MainLayout>
            }
          />

          <Route
            path="/blog/:slug"
            element={
              <MainLayout>
                <Suspense fallback={<PageFallback />}>
                  <BlogPostPage />
                </Suspense>
              </MainLayout>
            }
          />

          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<PageFallback />}>
                <Login />
              </Suspense>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageFallback />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="categories"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Categories />
                </Suspense>
              }
            />
            <Route
              path="media"
              element={
                <Suspense fallback={<PageFallback />}>
                  <MediaLibrary />
                </Suspense>
              }
            />
            <Route
              path="videos"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Videos />
                </Suspense>
              }
            />
            <Route
              path="blog"
              element={
                <Suspense fallback={<PageFallback />}>
                  <BlogList />
                </Suspense>
              }
            />
            <Route
              path="blog/new"
              element={
                <Suspense fallback={<PageFallback />}>
                  <BlogEditor />
                </Suspense>
              }
            />
            <Route
              path="blog/:id/edit"
              element={
                <Suspense fallback={<PageFallback />}>
                  <BlogEditor />
                </Suspense>
              }
            />
            <Route
              path="portfolio"
              element={
                <Suspense fallback={<PageFallback />}>
                  <PortfolioList />
                </Suspense>
              }
            />
            <Route
              path="portfolio/new"
              element={
                <Suspense fallback={<PageFallback />}>
                  <PortfolioEditor />
                </Suspense>
              }
            />
            <Route
              path="portfolio/:id/edit"
              element={
                <Suspense fallback={<PageFallback />}>
                  <PortfolioEditor />
                </Suspense>
              }
            />
            <Route
              path="gallery"
              element={
                <Suspense fallback={<PageFallback />}>
                  <GalleryManager />
                </Suspense>
              }
            />
            <Route
              path="destinations"
              element={
                <Suspense fallback={<PageFallback />}>
                  <Destinations />
                </Suspense>
              }
            />
            <Route
              path="about"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AboutEditor />
                </Suspense>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
