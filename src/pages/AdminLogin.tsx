import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './AdminLogin.css'

export function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Small delay to prevent brute force
    await new Promise((resolve) => setTimeout(resolve, 300))

    const success = await login(username, password)
    
    if (success) {
      // Redirect to the originally requested page or /admin
      const from = (location.state as { from?: string })?.from || '/admin'
      navigate(from, { replace: true })
    } else {
      setError('Incorrect username or password. Please try again.')
      setPassword('')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>Admin Access</h1>
          <p>Please enter the password to access the admin dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoFocus
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          <div className="admin-login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          {error && <div className="admin-login-error">{error}</div>}
          <button 
            type="submit" 
            className="admin-login-button"
            disabled={isLoading || !username.trim() || !password.trim()}
          >
            {isLoading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
