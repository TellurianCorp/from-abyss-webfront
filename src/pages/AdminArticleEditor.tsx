import { useNavigate, useParams } from 'react-router-dom'

import { AdminNavbar } from '../components/AdminNavbar'
import { AdminSidebar } from '../components/AdminSidebar'
import { ArticleEditor } from '../components/articles/ArticleEditor'
import layout from '../styles/AdminLayout.module.css'
import styles from '../styles/AdminArticleEditor.module.css'

export function AdminArticleEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className={layout.adminPage}>
      <AdminNavbar />
      <div className={layout.adminLayout}>
        <AdminSidebar />
        {/* The shared admin content padding is generous for a dashboard and
            cramped for an editor, so the surface reclaims some of it. */}
        <main className={`${layout.adminContent} ${styles.editorSurface}`}>
          <ArticleEditor articleId={id} onSave={() => navigate('/admin/articles')} />
        </main>
      </div>
    </div>
  )
}

export default AdminArticleEditor
