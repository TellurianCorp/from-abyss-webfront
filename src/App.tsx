import './App.css'
import { Routes, Route } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { Editorial } from './pages/Editorial'
import { Patreon } from './pages/Patreon'
import { Admin } from './pages/Admin'
import { AdminPatreon } from './pages/AdminPatreon'
import { KoliseumAdmin } from './pages/KoliseumAdmin'

function App() {
  return (
    <Routes>
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/editorial" element={<Editorial />} />
      <Route path="/patreon" element={<Patreon />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/patreon" element={<AdminPatreon />} />
      <Route path="/koliseum-admin" element={<KoliseumAdmin />} />
      <Route path="/" element={<Landing />} />
    </Routes>
  )
}

export default App
