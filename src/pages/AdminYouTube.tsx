import { AdminNavbar } from '../components/AdminNavbar'
import { AdminSidebar } from '../components/AdminSidebar'
import { YouTubeManagement } from '../components/YouTubeManagement'
import styles from '../styles/AdminLayout.module.css'

export function AdminYouTube() {
  return (
    <div className={styles.adminPage}>
      <AdminNavbar />
      <div className={styles.adminLayout}>
        <AdminSidebar />
        <main className={styles.adminContent}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>YouTube Management</h1>
            <p className={styles.pageDescription}>
              Manage YouTube channel integration, videos, and synchronization
            </p>
          </div>
          
          <div className={styles.contentSection}>
            <YouTubeManagement />
          </div>
        </main>
      </div>
    </div>
  )
}
