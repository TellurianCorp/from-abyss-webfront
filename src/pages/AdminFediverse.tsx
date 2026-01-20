import { AdminNavbar } from '../components/AdminNavbar'
import { AdminSidebar } from '../components/AdminSidebar'
import { FeediverseManagement } from '../components/FeediverseManagement'
import ActivityPubMonitor from '../components/ActivityPubMonitor'
import styles from '../styles/AdminLayout.module.css'

export function AdminFediverse() {
  return (
    <div className={styles.adminPage}>
      <AdminNavbar />
      <div className={styles.adminLayout}>
        <AdminSidebar />
        <main className={styles.adminContent}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Fediverse Management</h1>
            <p className={styles.pageDescription}>
              Manage Fediverse integration, ActivityPub, and highlighted profiles
            </p>
          </div>
          
          <div className={styles.contentSection}>
            <ActivityPubMonitor />
          </div>
          
          <div className={styles.contentSection}>
            <FeediverseManagement />
          </div>
        </main>
      </div>
    </div>
  )
}
