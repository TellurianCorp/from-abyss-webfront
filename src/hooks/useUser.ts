import { useState, useEffect } from 'react'

interface UserInfo {
  id: string
  email?: string
  name?: string
  picture?: string
  [key: string]: unknown
}

export function useUser() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Paint from the last known user so the header does not flicker, then
    // confirm against the API.
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo))
      } catch (e) {
        console.error('Failed to parse user info from localStorage:', e)
        localStorage.removeItem('userInfo')
      }
    }

    const fetchUserInfo = async () => {
      try {
        const { apiUrl } = await import('../utils/api')

        // The session is an HttpOnly cookie the API sets on the OIDC callback.
        // Script cannot read it, so there is no token to look for first, and it
        // only travels on cross-origin requests with credentials: 'include'.
        const response = await fetch(apiUrl('/v1/auth/me'), {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const userData = await response.json()
          const userIdValue = userData.id || userData.user_id || userData.sub
          if (userIdValue) {
            const user = { ...userData, id: String(userIdValue) }
            setUserInfo(user)
            localStorage.setItem('userInfo', JSON.stringify(user))
          }
        } else if (response.status === 401) {
          // Session gone or expired: drop the cached copy so the UI stops
          // showing a signed-in state that no longer exists.
          setUserInfo(null)
          localStorage.removeItem('userInfo')
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  return { userInfo, isLoading }
}
