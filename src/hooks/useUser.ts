import { useState, useEffect } from 'react'

interface UserInfo {
  id: string
  email?: string
  name?: string
  picture?: string
  [key: string]: any
}

export function useUser() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage first
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo))
      } catch (e) {
        console.error('Failed to parse user info from localStorage:', e)
      }
    }

    // Also try to fetch from API
    const fetchUserInfo = async () => {
      try {
        const { apiUrl } = await import('../utils/api')
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
            const userInfo = { ...userData, id: String(userIdValue) }
            setUserInfo(userInfo)
            localStorage.setItem('userInfo', JSON.stringify(userInfo))
          }
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
