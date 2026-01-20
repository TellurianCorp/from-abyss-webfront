import { useTranslation } from 'react-i18next'
import { AdminNavbar } from '../components/AdminNavbar'
import { AdminSidebar } from '../components/AdminSidebar'
import MetricsDashboard from '../components/MetricsDashboard'
import ActivityPubMonitor from '../components/ActivityPubMonitor'
import styles from '../styles/AdminLayout.module.css'

export function AdminRevamped() {
  const { t } = useTranslation()

  return (
    <div className={styles.adminPage}>
      <AdminNavbar />
      <div className={styles.adminLayout}>
        <AdminSidebar />
        <main className={styles.adminContent}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{t('admin.title') || 'Guardian Dashboard'}</h1>
            <p className={styles.pageDescription}>
              {t('admin.hero.description')}
            </p>
          </div>

          <div className={styles.contentSection}>
            <ActivityPubMonitor />
          </div>

          <div className={styles.contentSection}>
            <MetricsDashboard />
          </div>
        </main>
      </div>
    </div>
  )
}
