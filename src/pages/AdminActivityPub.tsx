import { AdminNavbar } from '../components/AdminNavbar'
import { AdminSidebar } from '../components/AdminSidebar'
import ActivityPubMonitor from '../components/ActivityPubMonitor'
import { RefreshCw } from 'react-feather'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import { useToast } from '../hooks/useToast'
import styles from '../styles/AdminLayout.module.css'

export function AdminActivityPub() {
  const { success, error: showError } = useToast()

  const handleSync = async () => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.activitypub.sync), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Federation sync completed:', data)
        success(
          `Tasks: ${data.tasks?.length || 0}\nPending follow requests: ${data.pending_follow_requests || 0}\nLocal actors: ${data.local_actors || 0}`,
          'Federation Sync Completed'
        )
      } else {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Federation sync failed:', error)
        showError(error.message || 'Unknown error', 'Federation Sync Failed')
      }
    } catch (error: any) {
      console.error('Error running federation sync:', error)
      showError(error.message || 'Unknown error', 'Federation Sync Error')
    }
  }

  return (
    <div className={styles.adminPage}>
      <AdminNavbar />
      <div className={styles.adminLayout}>
        <AdminSidebar />
        <main className={styles.adminContent}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>ActivityPub Management</h1>
            <p className={styles.pageDescription}>
              Monitor ActivityPub federation, actors, and interactions
            </p>
            <button onClick={handleSync} className={styles.syncButton}>
              <RefreshCw size={18} />
              <span>Run Federation Sync</span>
            </button>
          </div>
          
          <div className={styles.contentSection}>
            <ActivityPubMonitor />
          </div>
        </main>
      </div>
    </div>
  )
}
