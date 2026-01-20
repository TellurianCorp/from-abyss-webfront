import { AdminNavbar } from '../components/AdminNavbar'
import { AdminSidebar } from '../components/AdminSidebar'
import { FeedManagement } from '../components/FeedManagement'
import styles from '../styles/AdminLayout.module.css'

export function AdminFeeds() {
  return (
    <div className={styles.adminPage}>
      <AdminNavbar />
      <div className={styles.adminLayout}>
        <AdminSidebar />
        <main className={styles.adminContent}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Feed Administration</h1>
            <p className={styles.pageDescription}>
              Gerenciar feeds RSS, podcasts e artigos. Adicione feeds, monitore a saúde e sincronize episódios de podcast.
            </p>
          </div>
          
          <div className={styles.contentSection}>
            <FeedManagement />
          </div>
        </main>
      </div>
    </div>
  )
}
