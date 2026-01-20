import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { type Notification } from '../../contexts/NotificationContext'
import { useNotifications } from '../../hooks/useNotifications'
import styles from './NotificationItem.module.css'

interface NotificationItemProps {
  notification: Notification
  onClose: () => void
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { t } = useTranslation()
  const { markAsRead } = useNotifications()

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return t('microblog.time.justNow')
    if (diffInSeconds < 3600) return t('microblog.time.minutesAgo', { count: Math.floor(diffInSeconds / 60) })
    if (diffInSeconds < 86400) return t('microblog.time.hoursAgo', { count: Math.floor(diffInSeconds / 3600) })
    if (diffInSeconds < 604800) return t('microblog.time.daysAgo', { count: Math.floor(diffInSeconds / 86400) })

    return date.toLocaleDateString()
  }, [t])

  const getIcon = () => {
    switch (notification.type) {
      case 'follow':
      case 'follow_request':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        )
      case 'like':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        )
      case 'repost':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        )
      case 'reply':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )
      case 'mention':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
          </svg>
        )
      case 'federation':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        )
      default:
        return null
    }
  }

  const getIconClass = () => {
    switch (notification.type) {
      case 'follow':
      case 'follow_request':
        return styles.iconFollow
      case 'like':
        return styles.iconLike
      case 'repost':
        return styles.iconRepost
      case 'reply':
      case 'mention':
        return styles.iconReply
      case 'federation':
        return styles.iconFederation
      default:
        return ''
    }
  }

  const getMessage = () => {
    switch (notification.type) {
      case 'follow':
        return t('notifications.message.follow', { name: notification.actorName })
      case 'follow_request':
        return t('notifications.message.followRequest', { name: notification.actorName })
      case 'like':
        return t('notifications.message.like', { name: notification.actorName })
      case 'repost':
        return t('notifications.message.repost', { name: notification.actorName })
      case 'reply':
        return t('notifications.message.reply', { name: notification.actorName })
      case 'mention':
        return t('notifications.message.mention', { name: notification.actorName })
      case 'federation':
        return notification.message || t('notifications.message.federation')
      default:
        return notification.message || ''
    }
  }

  const handleClick = async () => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
      onClose()
    }
  }

  return (
    <div
      className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
      onClick={handleClick}
      role="listitem"
      aria-label={`${getMessage()} - ${formatDate(notification.createdAt)}`}
    >
      {/* Icon */}
      <div className={`${styles.iconContainer} ${getIconClass()}`}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Actor avatar */}
        {notification.actorAvatar ? (
          <img
            src={notification.actorAvatar}
            alt={notification.actorName}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {notification.actorName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Message and metadata */}
        <div className={styles.info}>
          <p className={styles.message}>{getMessage()}</p>

          {notification.targetContent && (
            <p className={styles.targetContent}>
              "{notification.targetContent}"
            </p>
          )}

          <span className={styles.timestamp}>
            {formatDate(notification.createdAt)}
          </span>
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.read && <div className={styles.unreadDot} aria-label="Unread" />}
    </div>
  )
}
