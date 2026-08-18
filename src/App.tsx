import './App.css'
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AdminRoute } from './components/AdminRoute'
import { WriterRoute } from './components/WriterRoute'
import Toaster from './components/Toaster'

// Lazy load routes for code splitting - only load when needed
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })))
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })))
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })))
const Editorial = lazy(() => import('./pages/Editorial').then(m => ({ default: m.Editorial })))
const Patreon = lazy(() => import('./pages/Patreon').then(m => ({ default: m.Patreon })))
const Roadmap = lazy(() => import('./pages/Roadmap').then(m => ({ default: m.Roadmap })))
const Microblog = lazy(() => import('./pages/Microblog').then(m => ({ default: m.Microblog })))
const Admin = lazy(() => import('./pages/AdminRevamped').then(m => ({ default: m.AdminRevamped })))
const AdminPatreonPage = lazy(() => import('./pages/AdminPatreonPage').then(m => ({ default: m.AdminPatreonPage })))
const AdminUsers = lazy(() => import('./pages/AdminUsers').then(m => ({ default: m.AdminUsers })))
const AdminFediverse = lazy(() => import('./pages/AdminFediverse').then(m => ({ default: m.AdminFediverse })))
const AdminYouTube = lazy(() => import('./pages/AdminYouTube').then(m => ({ default: m.AdminYouTube })))
const AdminActivityPub = lazy(() => import('./pages/AdminActivityPub').then(m => ({ default: m.AdminActivityPub })))
const AdminArticles = lazy(() => import('./pages/AdminArticles').then(m => ({ default: m.AdminArticles })))
const AdminArticleEditor = lazy(() => import('./pages/AdminArticleEditor').then(m => ({ default: m.AdminArticleEditor })))
const AdminFeeds = lazy(() => import('./pages/AdminFeeds').then(m => ({ default: m.AdminFeeds })))
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })))
const KoliseumAdmin = lazy(() => import('./pages/KoliseumAdmin').then(m => ({ default: m.KoliseumAdmin })))
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })))
const Articles = lazy(() => import('./pages/Articles').then(m => ({ default: m.Articles })))
const ArticleEditor = lazy(() => import('./pages/ArticleEditor').then(m => ({ default: m.ArticleEditor })))
const ArticleView = lazy(() => import('./pages/ArticleView').then(m => ({ default: m.ArticleView })))

// Loading fallback component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh' 
  }}>
    <div>Loading...</div>
  </div>
)

function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/editorial" element={<Editorial />} />
          <Route path="/patreon" element={<Patreon />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/microblog" element={<Microblog />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<ArticleView />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/patreon"
            element={
              <AdminRoute>
                <AdminPatreonPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/fediverse"
            element={
              <AdminRoute>
                <AdminFediverse />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/fediverse/activitypub"
            element={
              <AdminRoute>
                <AdminActivityPub />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/youtube"
            element={
              <AdminRoute>
                <AdminYouTube />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/feeds"
            element={
              <AdminRoute>
                <AdminFeeds />
              </AdminRoute>
            }
          />
          <Route
            path="/koliseum-admin"
            element={
              <AdminRoute>
                <KoliseumAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/articles"
            element={
              <WriterRoute>
                <AdminArticles />
              </WriterRoute>
            }
          />
          <Route
            path="/admin/articles/new"
            element={
              <WriterRoute>
                <AdminArticleEditor />
              </WriterRoute>
            }
          />
          <Route
            path="/admin/articles/:id/edit"
            element={
              <WriterRoute>
                <AdminArticleEditor />
              </WriterRoute>
            }
          />
          <Route
            path="/articles/new"
            element={
              <WriterRoute>
                <ArticleEditor />
              </WriterRoute>
            }
          />
          <Route
            path="/articles/:id/edit"
            element={
              <WriterRoute>
                <ArticleEditor />
              </WriterRoute>
            }
          />
          <Route path="/" element={<Landing />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  )
}

export default App
