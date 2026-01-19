import { createContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { apiUrl, API_ENDPOINTS } from '../utils/api'

export interface Notification {
  id: string
  type: 'follow' | 'follow_request' | 'like' | 'repost' | 'reply' | 'mention' | 'federation'
  actorId: string
  actorName: string
  actorHandle: string
  actorAvatar?: string
  targetId?: string
  targetType?: 'post' | 'user'
  targetContent?: string
  message?: string
  read: boolean
  createdAt: string
  actionUrl?: string
}

export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => Promise<void>
  addNotification: (notification: Notification) => void
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
  userId?: string
}

export function NotificationProvider({ children, userId }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        apiUrl(`${API_ENDPOINTS.microblog.notifications.base}?limit=50`),
        { credentials: 'include' }
      )

      if (response.ok) {
        const data = await response.json()
        const notificationsList = data.notifications || data || []
        setNotifications(notificationsList)

        // Count unread
        const unread = notificationsList.filter((n: Notification) => !n.read).length
        setUnreadCount(unread)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch notifications')
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Fetch unread count (lightweight)
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return

    try {
      const response = await fetch(
        apiUrl(API_ENDPOINTS.microblog.notifications.unreadCount),
        { credentials: 'include' }
      )

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count || 0)
      }
    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }, [userId])

  // Initial load
  useEffect(() => {
    if (userId) {
      fetchNotifications()

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [userId, fetchNotifications, fetchUnreadCount])

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))

      const response = await fetch(
        apiUrl(API_ENDPOINTS.microblog.notifications.markRead(id)),
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        // Revert on error
        const notification = notifications.find(n => n.id === id)
        if (notification && !notification.read) {
          setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: false } : n)
          )
          setUnreadCount(prev => prev + 1)
        }
        throw new Error('Failed to mark notification as read')
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [notifications])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      const prevNotifications = notifications
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)

      const response = await fetch(
        apiUrl(API_ENDPOINTS.microblog.notifications.markAllRead),
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        // Revert on error
        setNotifications(prevNotifications)
        setUnreadCount(prevNotifications.filter(n => !n.read).length)
        throw new Error('Failed to mark all notifications as read')
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }, [notifications])

  // Refresh notifications
  const refresh = useCallback(async () => {
    await fetchNotifications()
  }, [fetchNotifications])

  // Add a new notification (for real-time updates via WebSocket)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
    if (!notification.read) {
      setUnreadCount(prev => prev + 1)
    }
  }, [])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
    addNotification,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
