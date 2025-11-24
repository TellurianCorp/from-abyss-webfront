import { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginButton, LogoutButton } from './components/auth'

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [count, setCount] = useState(0)

  if (isLoading) {
    return (
      <div className="loading">
        <h2>Loading...</h2>
      </div>
    )
  }

  return (
    <>
      <header className="app-header">
        <h1>From Abyss Media</h1>
        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-info">
              {user?.picture && (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="user-avatar"
                />
              )}
              <span className="user-name">{user?.name}</span>
              <LogoutButton />
            </div>
          ) : (
            <LoginButton />
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="hero">
          <h2>Welcome to From Abyss Media</h2>
          <p className="tagline">
            Explore the depths of horror content
          </p>
        </div>

        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>

        {isAuthenticated && (
          <div className="authenticated-content">
            <h3>🎉 You are authenticated!</h3>
            <p>Welcome back, {user?.name}</p>
            <div className="user-details">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Verified:</strong> {user?.email_verified ? '✓ Yes' : '✗ No'}</p>
            </div>
          </div>
        )}

        <div className="info-section">
          <h3>About From Abyss Media</h3>
          <p>
            A horror-focused multimedia portal featuring content, community,
            and federation capabilities powered by ActivityPub.
          </p>
        </div>
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 From Abyss Media - Tellurian Corp</p>
      </footer>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
