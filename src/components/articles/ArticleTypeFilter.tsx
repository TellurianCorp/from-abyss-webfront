import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useArticleTypes } from '../../hooks/useArticleTypes'
import { articleTypeLabel } from './articleTypeLabel'
import styles from './ArticleTypeFilter.module.css'

interface ArticleTypeFilterProps {
  /** The type currently being shown, from the route. Empty means all types. */
  value?: string
}

/**
 * Filtering navigates rather than holding state of its own.
 *
 * The alternative -- a local filter on /articles alongside separate
 * /articles/type/<slug> pages -- would mean two mechanisms for one idea, each
 * able to disagree with the other about what is being shown. Navigating makes
 * the URL the single source of truth, and the filtered view is shareable and
 * linkable for free.
 */
export function ArticleTypeFilter({ value = '' }: ArticleTypeFilterProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { types, loading } = useArticleTypes()
  const language = i18n.language || 'pt-BR'

  // Nothing to filter by: rather than show a select with a single option, stay
  // out of the way entirely.
  if (!loading && types.length === 0) return null

  return (
    <div className={styles.bar}>
      <label className={styles.label} htmlFor="fa-article-type-filter">
        {t('articles.type.filterLabel', 'Type')}
      </label>
      <select
        id="fa-article-type-filter"
        className={styles.select}
        value={value}
        disabled={loading}
        onChange={(event) => {
          const slug = event.target.value
          navigate(slug ? `/articles/type/${slug}` : '/articles')
        }}
      >
        <option value="">{t('articles.type.all', 'All types')}</option>
        {types.map((articleType) => (
          <option key={articleType.id} value={articleType.slug}>
            {articleTypeLabel(articleType, language)}
          </option>
        ))}
      </select>
    </div>
  )
}
