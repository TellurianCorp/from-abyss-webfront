import { useState, useEffect } from 'react'
import { MicroblogTimeline } from '../components/MicroblogTimeline'
import { UserLogin } from '../components/UserLogin'
import { Navbar } from '../components/Navbar'
import { apiUrl } from '../utils/api'
import pageStyles from '../styles/Page.module.css'

interface UserInfo {
  id: string
  email?: string
  name?: string
  [key: string]: any
}

export function Microblog() {
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check if user is already logged in
  useEffect(() => {
    checkAuth()
    
    // Check if we're returning from OIDC callback
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('code') || urlParams.get('state')) {
      // We're returning from OIDC callback, wait a bit then check auth
      setTimeout(() => {
        checkAuth()
        // Clean up URL params
        window.history.replaceState({}, document.title, window.location.pathname)
      }, 1000)
    }
  }, [])

  const checkAuth = async () => {
    try {
      // Try /v1/auth/me first, then /v1/me as fallback
      let response = await fetch(apiUrl('/v1/auth/me'), {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        response = await fetch(apiUrl('/v1/me'), {
          method: 'GET',
          credentials: 'include',
        })
      }

      if (response.ok) {
        const userData = await response.json()
        const userIdValue = userData.id || userData.user_id || userData.sub
        if (userIdValue) {
          setUserId(String(userIdValue))
          setUserInfo(userData)
          // Store in localStorage as fallback
          localStorage.setItem('userId', String(userIdValue))
          localStorage.setItem('userInfo', JSON.stringify(userData))
        }
      } else {
        // Check localStorage as fallback
        const storedUserId = localStorage.getItem('userId')
        const storedUserInfo = localStorage.getItem('userInfo')
        if (storedUserId && storedUserInfo) {
          setUserId(storedUserId)
          setUserInfo(JSON.parse(storedUserInfo))
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Check localStorage as fallback
      const storedUserId = localStorage.getItem('userId')
      const storedUserInfo = localStorage.getItem('userInfo')
      if (storedUserId && storedUserInfo) {
        setUserId(storedUserId)
        setUserInfo(JSON.parse(storedUserInfo))
      }
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleLoginSuccess = (id: string, info: any) => {
    setUserId(String(id))
    setUserInfo(info)
    setShowLogin(false)
    // Store in localStorage as fallback
    localStorage.setItem('userId', String(id))
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const handleLogout = async () => {
    try {
      await fetch(apiUrl('/v1/auth/logout'), {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUserId(undefined)
      setUserInfo(null)
      localStorage.removeItem('userId')
      localStorage.removeItem('userInfo')
    }
  }

  if (isCheckingAuth) {
    return (
      <div className={pageStyles.page}>
        <Navbar />
        <main className={pageStyles.pageContent} role="main">
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
            <p>Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={pageStyles.page}>
      <Navbar />
      <main className={pageStyles.pageContent} role="main">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
          {!userId && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '2rem',
              padding: '2rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h2 style={{ color: 'var(--bone)', marginBottom: '1rem' }}>Welcome to the Microblog</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
                Sign in to create posts, follow users, and interact with the community.
              </p>
              <button
                onClick={() => setShowLogin(true)}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(120deg, var(--blood), rgba(176, 58, 58, 0.8))',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(176, 58, 58, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Sign In
              </button>
            </div>
          )}
          
          {userId && (
            <div style={{ 
              marginBottom: '1rem',
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Signed in as: </span>
                <strong style={{ color: 'var(--bone)' }}>
                  {userInfo?.name || userInfo?.email || userId}
                </strong>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--muted)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.color = 'var(--bone)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.color = 'var(--muted)'
                }}
              >
                Sign Out
              </button>
            </div>
          )}

          <MicroblogTimeline userId={userId} />
        </div>
      </main>
      
      {showLogin && (
        <UserLogin
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setShowLogin(false)}
        />
      )}
    </div>
  )
}
