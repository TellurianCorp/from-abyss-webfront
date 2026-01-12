import './App.css'
import { Routes, Route } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { Editorial } from './pages/Editorial'
import { Patreon } from './pages/Patreon'
import { Roadmap } from './pages/Roadmap'
import { Admin } from './pages/Admin'
import { AdminPatreon } from './pages/AdminPatreon'
import { AdminLogin } from './pages/AdminLogin'
import { KoliseumAdmin } from './pages/KoliseumAdmin'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/editorial" element={<Editorial />} />
      <Route path="/patreon" element={<Patreon />} />
      <Route path="/roadmap" element={<Roadmap />} />
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
        path="/koliseum-admin"
        element={
          <ProtectedRoute>
            <KoliseumAdmin />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Landing />} />
    </Routes>
  )
}

export default App
