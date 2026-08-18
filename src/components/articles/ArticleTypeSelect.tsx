import { useTranslation } from 'react-i18next'

import { useArticleTypes } from '../../hooks/useArticleTypes'
import type { ArticleType } from '../../services/articleTypeService'
import { articleTypeLabel } from './articleTypeLabel'
import styles from './ArticleTypeSelect.module.css'

interface ArticleTypeSelectProps {
  /**
   * The chosen slug, `''` for none, or `undefined` while the article is still
   * loading. The control is disabled in that last state so a writer cannot
   * pick a type against an article whose own type has not arrived yet.
   */
  value: string | undefined
  onChange: (slug: string) => void
  /**
   * The article's own type, when it has one. Retiring a type removes it from
   * the live vocabulary but leaves articles carrying it, so without this the
   * control would show a blank selection for an article that plainly has a
   * type -- and the writer would have no idea what they were about to change.
   */
  current?: ArticleType
  disabled?: boolean
}

export function ArticleTypeSelect({ value, onChange, current, disabled }: ArticleTypeSelectProps) {
  const { t, i18n } = useTranslation()
  const { types, loading, error } = useArticleTypes()
  const language = i18n.language || 'pt-BR'

  const retired = current && !types.some((articleType) => articleType.slug === current.slug)
    ? current
    : undefined

  return (
    <div className={styles.field}>
      <label htmlFor="fa-article-type">{t('articles.type.label', 'Type')}</label>
      <select
        id="fa-article-type"
        className={styles.select}
        value={value ?? ''}
        disabled={disabled || loading || value === undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{t('articles.type.none', 'No type')}</option>
        {types.map((articleType) => (
          <option key={articleType.id} value={articleType.slug}>
            {articleTypeLabel(articleType, language)}
          </option>
        ))}
        {retired && (
          <option value={retired.slug}>
            {t('articles.type.retiredOption', '{{name}} (retired)', {
              name: articleTypeLabel(retired, language),
            })}
          </option>
        )}
      </select>
      {error ? (
        <p className={styles.error}>{t('articles.type.loadError', 'Could not load the types')}</p>
      ) : (
        <p className={styles.hint}>
          {t('articles.type.hint', 'News, Review, Opinion and the rest. Optional.')}
        </p>
      )}
    </div>
  )
}
