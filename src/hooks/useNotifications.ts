import { useContext } from 'react'
import { NotificationContext, type NotificationContextType } from '../contexts/NotificationContext'

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext)

  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }

  return context
}
