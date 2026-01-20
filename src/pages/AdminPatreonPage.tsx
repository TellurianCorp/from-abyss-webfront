import { AdminNavbar } from '../components/AdminNavbar'
import { AdminSidebar } from '../components/AdminSidebar'
import { PatreonManagement } from '../components/PatreonManagement'
import styles from '../styles/AdminLayout.module.css'

export function AdminPatreonPage() {
  return (
    <div className={styles.adminPage}>
      <AdminNavbar />
      <div className={styles.adminLayout}>
        <AdminSidebar />
        <main className={styles.adminContent}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Patreon Management</h1>
            <p className={styles.pageDescription}>
              Manage Patreon integration, campaigns, and supporter data
            </p>
          </div>
          
          <div className={styles.contentSection}>
            <PatreonManagement />
          </div>
        </main>
      </div>
    </div>
  )
}
