import { useState, useEffect } from 'react'
import { apiUrl } from '../utils/api'

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  success: boolean
  session_id?: string
  admin?: {
    id: string
    username: string
    email: string
    is_super: boolean
  }
  message?: string
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState<boolean>(true)

  useEffect(() => {
    // Check if user is authenticated on mount by calling /v1/admin/me
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch(apiUrl('/v1/admin/me'), {
        method: 'GET',
        credentials: 'include', // Include cookies
      })

      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
    } finally {
      setIsChecking(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(apiUrl('/v1/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ username, password } as LoginRequest),
      })

      const data: LoginResponse = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch(apiUrl('/v1/admin/logout'), {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsAuthenticated(false)
    }
  }

  return {
    isAuthenticated,
    isChecking,
    login,
    logout,
  }
}
