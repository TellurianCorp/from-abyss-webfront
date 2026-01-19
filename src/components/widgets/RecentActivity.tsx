import { useTranslation } from 'react-i18next'
import { useActivityPub } from '../../hooks/useActivityPub'
import { WidgetCard } from './WidgetCard'
import styles from './RecentActivity.module.css'

export function RecentActivity() {
  const { t } = useTranslation()
  const { recentActivity } = useActivityPub()

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return t('time.justNow', 'just now')
    if (diffInSeconds < 3600) return t('time.minutesAgo', { count: Math.floor(diffInSeconds / 60), defaultValue: '{{count}}m' })
    if (diffInSeconds < 86400) return t('time.hoursAgo', { count: Math.floor(diffInSeconds / 3600), defaultValue: '{{count}}h' })
    return t('time.daysAgo', { count: Math.floor(diffInSeconds / 86400), defaultValue: '{{count}}d' })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        )
      case 'like':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        )
      case 'repost':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        )
      case 'reply':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )
    }
  }

  const getActivityMessage = (activity: typeof recentActivity[0]): string => {
    switch (activity.type) {
      case 'follow':
        return t('activity.follow', { name: activity.actorName, defaultValue: '{{name}} followed you' })
      case 'like':
        return t('activity.like', { name: activity.actorName, defaultValue: '{{name}} liked your post' })
      case 'repost':
        return t('activity.repost', { name: activity.actorName, defaultValue: '{{name}} reposted' })
      case 'reply':
        return t('activity.reply', { name: activity.actorName, defaultValue: '{{name}} replied' })
      case 'post':
        return t('activity.post', { name: activity.actorName, defaultValue: '{{name}} posted' })
      default:
        return activity.actorName
    }
  }

  const icon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )

  return (
    <WidgetCard
      title={t('activity.title', 'Recent Activity')}
      icon={icon}
    >
      {recentActivity && recentActivity.length > 0 ? (
        <div className={styles.activityList}>
          {recentActivity.slice(0, 5).map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={`${styles.activityIcon} ${styles[activity.type]}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className={styles.activityContent}>
                {activity.actorAvatar ? (
                  <img src={activity.actorAvatar} alt={activity.actorName} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {activity.actorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={styles.activityInfo}>
                  <div className={styles.activityMessage}>
                    {getActivityMessage(activity)}
                  </div>
                  <div className={styles.activityMeta}>
                    <span className={styles.domain}>{activity.domain}</span>
                    <span className={styles.separator}>·</span>
                    <span className={styles.time}>{formatTime(activity.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>{t('activity.empty', 'No recent activity')}</p>
        </div>
      )}
    </WidgetCard>
  )
}
