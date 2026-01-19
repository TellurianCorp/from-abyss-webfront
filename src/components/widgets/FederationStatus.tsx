import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useActivityPub } from '../../hooks/useActivityPub'
import { WidgetCard } from './WidgetCard'
import styles from './FederationStatus.module.css'

export function FederationStatus() {
  const { t } = useTranslation()
  const { federationStatus, recentActivity } = useActivityPub()

  const hasActivity = recentActivity && recentActivity.length > 0

  const icon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={hasActivity ? styles.rotating : ''}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )

  return (
    <WidgetCard
      title={t('federation.title', 'Federation')}
      icon={icon}
      action={
        <Link to="/federation" className={styles.viewMoreLink}>
          {t('common.viewMore', 'View more')}
        </Link>
      }
    >
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>
            {federationStatus?.totalInstances || 0}
          </div>
          <div className={styles.statLabel}>
            {t('federation.instances', 'Instances')}
          </div>
        </div>

        <div className={styles.stat}>
          <div className={styles.statValue}>
            {federationStatus?.totalRemoteFollowers || 0}
          </div>
          <div className={styles.statLabel}>
            {t('federation.followers', 'Remote Followers')}
          </div>
        </div>

        <div className={styles.stat}>
          <div className={styles.statValue}>
            {federationStatus?.totalRemoteFollowing || 0}
          </div>
          <div className={styles.statLabel}>
            {t('federation.following', 'Following')}
          </div>
        </div>
      </div>

      {federationStatus?.recentActivityCount !== undefined && (
        <div className={styles.activity}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span>
            {t('federation.recentActivity', {
              count: federationStatus.recentActivityCount,
              defaultValue: '{{count}} recent activities'
            })}
          </span>
        </div>
      )}

      {federationStatus && !federationStatus.isHealthy && (
        <div className={styles.warning}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>{t('federation.unhealthy', 'Some federation issues detected')}</span>
        </div>
      )}
    </WidgetCard>
  )
}
