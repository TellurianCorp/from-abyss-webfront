import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArticleList } from '../components/articles/ArticleList'
import { useUser } from '../hooks/useUser'
import styles from './Articles.module.css'

export function Articles() {
  const { t } = useTranslation()
  const { canWriteArticles } = useUser()

  return (
    <div>
      {canWriteArticles && (
        <div className={styles.actions}>
          <Link className={styles.newArticle} to="/articles/new">
            {t('articles.newArticle', 'New article')}
          </Link>
        </div>
      )}
      <ArticleList />
    </div>
  )
}
