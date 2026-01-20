import { useParams, useNavigate } from 'react-router-dom'
import { ArticleEditor as ArticleEditorComponent } from '../components/articles/ArticleEditor'

export function ArticleEditor() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()

  const handleSave = () => {
    // Redirect to articles list after save
    navigate('/articles')
  }

  return (
    <div>
      <ArticleEditorComponent articleId={id} onSave={handleSave} />
    </div>
  )
}
