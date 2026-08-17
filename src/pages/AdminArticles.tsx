import { useTranslation } from 'react-i18next'

import { AdminNavbar } from '../components/AdminNavbar'
import { AdminSidebar } from '../components/AdminSidebar'
import { AdminArticleList } from '../components/articles/AdminArticleList'
import styles from '../styles/AdminLayout.module.css'

export function AdminArticles() {
  const { t } = useTranslation()

  return (
    <div className={styles.adminPage}>
      <AdminNavbar />
      <div className={styles.adminLayout}>
        <AdminSidebar />
        <main className={styles.adminContent}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{t('articles.admin.title', 'Articles')}</h1>
            <p className={styles.pageDescription}>
              {t(
                'articles.admin.description',
                'Drafts and published pieces, in Portuguese and English.',
              )}
            </p>
          </div>

          <div className={styles.contentSection}>
            <AdminArticleList />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminArticles
