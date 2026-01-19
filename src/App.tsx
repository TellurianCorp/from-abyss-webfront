import './App.css'
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'

// Lazy load routes for code splitting - only load when needed
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })))
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })))
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })))
const Editorial = lazy(() => import('./pages/Editorial').then(m => ({ default: m.Editorial })))
const Patreon = lazy(() => import('./pages/Patreon').then(m => ({ default: m.Patreon })))
const Roadmap = lazy(() => import('./pages/Roadmap').then(m => ({ default: m.Roadmap })))
const Microblog = lazy(() => import('./pages/Microblog').then(m => ({ default: m.Microblog })))
const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })))
const AdminPatreon = lazy(() => import('./pages/AdminPatreon').then(m => ({ default: m.AdminPatreon })))
const AdminUsers = lazy(() => import('./pages/AdminUsers').then(m => ({ default: m.AdminUsers })))
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })))
const KoliseumAdmin = lazy(() => import('./pages/KoliseumAdmin').then(m => ({ default: m.KoliseumAdmin })))
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })))

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
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/editorial" element={<Editorial />} />
        <Route path="/patreon" element={<Patreon />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/microblog" element={<Microblog />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patreon"
          element={
            <ProtectedRoute>
              <AdminPatreon />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/koliseum-admin"
          element={
            <ProtectedRoute>
              <KoliseumAdmin />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Landing />} />
      </Routes>
    </Suspense>
  )
}

export default App
