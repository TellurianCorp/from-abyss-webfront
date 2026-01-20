import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotifications } from '../../hooks/useNotifications'
import { NotificationItem } from './NotificationItem'
import styles from './NotificationDropdown.module.css'

interface NotificationDropdownProps {
  onClose: () => void
}

type NotificationFilter = 'all' | 'follows' | 'likes' | 'replies' | 'mentions'

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { t } = useTranslation()
  const { notifications, unreadCount, markAllAsRead, loading } = useNotifications()
  const [filter, setFilter] = useState<NotificationFilter>('all')

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'follows') return notification.type === 'follow' || notification.type === 'follow_request'
    if (filter === 'likes') return notification.type === 'like'
    if (filter === 'replies') return notification.type === 'reply'
    if (filter === 'mentions') return notification.type === 'mention'
    return false
  })

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  return (
    <div className={styles.dropdown}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>{t('notifications.title', 'Notifications')}</h3>
        {unreadCount > 0 && (
          <button
            className={styles.markAllButton}
            onClick={handleMarkAllAsRead}
            aria-label={t('notifications.markAllRead', 'Mark all as read')}
          >
            {t('notifications.markAllRead', 'Mark all as read')}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className={styles.filters} role="tablist">
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
          role="tab"
          aria-selected={filter === 'all'}
        >
          {t('notifications.filter.all', 'All')}
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'follows' ? styles.active : ''}`}
          onClick={() => setFilter('follows')}
          role="tab"
          aria-selected={filter === 'follows'}
        >
          {t('notifications.filter.follows', 'Follows')}
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'likes' ? styles.active : ''}`}
          onClick={() => setFilter('likes')}
          role="tab"
          aria-selected={filter === 'likes'}
        >
          {t('notifications.filter.likes', 'Likes')}
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'replies' ? styles.active : ''}`}
          onClick={() => setFilter('replies')}
          role="tab"
          aria-selected={filter === 'replies'}
        >
          {t('notifications.filter.replies', 'Replies')}
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'mentions' ? styles.active : ''}`}
          onClick={() => setFilter('mentions')}
          role="tab"
          aria-selected={filter === 'mentions'}
        >
          {t('notifications.filter.mentions', 'Mentions')}
        </button>
      </div>

      {/* Notifications list */}
      <div className={styles.notificationsList} role="list">
        {loading && filteredNotifications.length === 0 ? (
          <div className={styles.loading}>
            <div className="spinner"></div>
            <p>{t('notifications.loading', 'Loading...')}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <p>{t('notifications.empty', 'No notifications')}</p>
          </div>
        ) : (
          filteredNotifications.slice(0, 20).map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClose={onClose}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <a href="/notifications" className={styles.viewAllLink}>
          {t('notifications.viewAll', 'View all notifications')}
        </a>
      </div>
    </div>
  )
}
