import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { apiUrl } from '../utils/api'
import './UserLogin.css'

interface UserLoginProps {
  onLoginSuccess: (userId: string, userInfo: any) => void
  onCancel?: () => void
}

export function UserLogin({ onLoginSuccess, onCancel }: UserLoginProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [useOIDC, setUseOIDC] = useState(false)

  const handleDirectLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Try direct email/password login
      const response = await fetch(apiUrl('/v1/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // If we get user info directly
        if (data.user) {
          const userId = data.user.id || data.user.user_id
          if (userId) {
            onLoginSuccess(String(userId), data.user)
            return
          }
        }
        
        // Try to get user info from /v1/auth/me or /v1/me
        let meResponse = await fetch(apiUrl('/v1/auth/me'), {
          method: 'GET',
          credentials: 'include',
        })
        
        if (!meResponse.ok) {
          meResponse = await fetch(apiUrl('/v1/me'), {
            method: 'GET',
            credentials: 'include',
          })
        }
        
        if (meResponse.ok) {
          const userData = await meResponse.json()
          const userId = userData.id || userData.user_id
          if (userId) {
            onLoginSuccess(String(userId), userData)
            return
          }
        }
        
        setError('Login successful but could not retrieve user information')
      } else {
        const errorData = await response.json().catch(() => ({}))
        // If direct login fails, offer OIDC as fallback
        if (response.status === 404 || response.status === 501) {
          setError('Direct login not available. Please use OIDC login.')
          setUseOIDC(true)
        } else {
          setError(errorData.message || 'Invalid email or password. Please try again.')
          setPassword('')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred during login. Please try again.')
      setPassword('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOIDCLogin = () => {
    setIsLoading(true)
    
    // The /v1/auth/login endpoint uses OIDC and redirects to LifeAuth
    // Store the return URL so we can come back after authentication
    const returnUrl = window.location.href
    sessionStorage.setItem('authReturnUrl', returnUrl)
    
    // Redirect to the OIDC login endpoint
    // This will redirect to LifeAuth, then back to /v1/auth/callback
    window.location.href = apiUrl('/v1/auth/login')
  }

  if (useOIDC) {
    return (
      <div className="user-login-overlay">
        <div className="user-login-container">
          <div className="user-login-header">
            <h2>{t('login.title', 'Sign In')}</h2>
            <p>{t('login.subtitle', 'Sign in with your account to access all features')}</p>
          </div>
          <div className="user-login-content">
            <p className="user-login-description">
              You will be redirected to LifeAuth to complete the authentication process.
            </p>
            <div className="user-login-actions">
              <button
                type="button"
                className="user-login-button user-login-button-secondary"
                onClick={() => setUseOIDC(false)}
                disabled={isLoading}
              >
                {t('login.back', 'Back')}
              </button>
              {onCancel && (
                <button
                  type="button"
                  className="user-login-button user-login-button-secondary"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  {t('login.cancel', 'Cancel')}
                </button>
              )}
              <button
                type="button"
                className="user-login-button user-login-button-primary"
                onClick={handleOIDCLogin}
                disabled={isLoading}
              >
                {isLoading ? t('login.loading', 'Redirecting...') : t('login.oidc', 'Sign In with LifeAuth')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="user-login-overlay">
      <div className="user-login-container">
        <div className="user-login-header">
          <h2>{t('login.title', 'Sign In')}</h2>
          <p>{t('login.subtitle', 'Enter your credentials to access your account')}</p>
        </div>
        <form onSubmit={handleDirectLogin} className="user-login-form">
          <div className="user-login-field">
            <label htmlFor="email">{t('login.email', 'Email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.emailPlaceholder', 'your.email@example.com')}
              autoFocus
              disabled={isLoading}
              autoComplete="email"
              required
            />
          </div>
          <div className="user-login-field">
            <label htmlFor="password">{t('login.password', 'Password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.passwordPlaceholder', 'Enter your password')}
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <div className="user-login-error">{error}</div>}
          <div className="user-login-actions">
            {onCancel && (
              <button
                type="button"
                className="user-login-button user-login-button-secondary"
                onClick={onCancel}
                disabled={isLoading}
              >
                {t('login.cancel', 'Cancel')}
              </button>
            )}
            <button
              type="submit"
              className="user-login-button user-login-button-primary"
              disabled={isLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? t('login.loading', 'Signing in...') : t('login.submit', 'Sign In')}
            </button>
          </div>
        </form>
        <div className="user-login-footer">
          <p>
            {t('login.useOIDC', 'Or')}{' '}
            <button
              type="button"
              className="user-login-link"
              onClick={() => setUseOIDC(true)}
              disabled={isLoading}
            >
              {t('login.oidc', 'Sign in with LifeAuth')}
            </button>
          </p>
          <p>{t('login.noAccount', "Don't have an account?")} <a href="/contact">{t('login.contactUs', 'Contact us')}</a></p>
        </div>
      </div>
    </div>
  )
}
