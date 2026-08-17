import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Edit2, Eye, Plus } from 'react-feather'

import articleService, { type Article } from '../../services/articleService'
import { WorkflowStatusBadge } from './WorkflowStatusBadge'
import styles from './AdminArticleList.module.css'

const PAGE_SIZE = 20

const SUPPORTED_LANGUAGES = ['pt-BR', 'en-GB'] as const

/** Every state the API's workflow models, plus "any". */
const STATUSES = [
  'draft',
  'in_review',
  'reviewed',
  'approved',
  'published',
  'archived',
] as const

/**
 * The editorial list: drafts and everything else.
 *
 * Distinct from the public ArticleList, which reads the public endpoint and so
 * only ever shows what is already published — no use to someone looking for
 * their own unfinished work.
 */
export function AdminArticleList() {
  const { t, i18n } = useTranslation()

  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await articleService.listArticles({
        status: status || undefined,
        limit: PAGE_SIZE,
        offset,
      })
      setArticles(response.articles ?? [])
      setTotal(response.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [status, offset])

  useEffect(() => {
    void load()
  }, [load])

  /** Falls back across languages so a row is never blank. */
  const titleOf = (article: Article): string => {
    const translations = article.translations ?? {}
    for (const language of [i18n.language, ...SUPPORTED_LANGUAGES]) {
      const title = translations[language]?.title
      if (title) return title
    }
    return t('articles.list.untitled', 'Untitled')
  }

  /** Which languages actually have a title and body. */
  const languagesOf = (article: Article): string[] =>
    SUPPORTED_LANGUAGES.filter((language) => {
      const translation = article.translations?.[language]
      return Boolean(translation?.title && translation?.content)
    })

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <label className={styles.filterLabel} htmlFor="fa-article-status">
          {t('articles.list.filterStatus', 'Status')}
        </label>
        <select
          id="fa-article-status"
          className={styles.select}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setOffset(0)
          }}
        >
          <option value="">{t('articles.list.anyStatus', 'Any')}</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {t(`articles.status.${value}`, value.replace('_', ' '))}
            </option>
          ))}
        </select>

        <Link className={styles.newButton} to="/admin/articles/new">
          <Plus size={15} /> {t('articles.list.new', 'New article')}
        </Link>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading && <p className={styles.notice}>{t('articles.list.loading', 'Loading…')}</p>}

      {!loading && !error && articles.length === 0 && (
        <p className={styles.notice}>
          {t('articles.list.empty', 'No articles yet. Write the first one.')}
        </p>
      )}

      {articles.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('articles.list.colTitle', 'Title')}</th>
              <th>{t('articles.list.colStatus', 'Status')}</th>
              <th>{t('articles.list.colLanguages', 'Languages')}</th>
              <th>{t('articles.list.colUpdated', 'Updated')}</th>
              <th className={styles.actionsHeader}>
                {t('articles.list.colActions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td>
                  <Link className={styles.title} to={`/admin/articles/${article.id}/edit`}>
                    {titleOf(article)}
                  </Link>
                </td>
                <td>
                  <WorkflowStatusBadge status={article.status} />
                </td>
                <td className={styles.languages}>
                  {languagesOf(article).join(' · ') || '—'}
                </td>
                <td className={styles.updated}>
                  {new Date(article.updated_at).toLocaleDateString(i18n.language)}
                </td>
                <td className={styles.actions}>
                  <Link
                    className={styles.action}
                    to={`/admin/articles/${article.id}/edit`}
                    title={t('articles.list.edit', 'Edit')}
                    aria-label={t('articles.list.edit', 'Edit')}
                  >
                    <Edit2 size={15} />
                  </Link>
                  {article.status === 'published' && (
                    <Link
                      className={styles.action}
                      to={`/articles/${article.slug}`}
                      title={t('articles.list.view', 'View')}
                      aria-label={t('articles.list.view', 'View')}
                    >
                      <Eye size={15} />
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {total > PAGE_SIZE && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageButton}
            disabled={offset === 0}
            onClick={() => setOffset((current) => Math.max(0, current - PAGE_SIZE))}
          >
            {t('articles.list.previous', 'Previous')}
          </button>
          <span className={styles.pageInfo}>
            {t('articles.list.pageInfo', '{{from}}–{{to}} of {{total}}', {
              from: offset + 1,
              to: Math.min(offset + PAGE_SIZE, total),
              total,
            })}
          </span>
          <button
            type="button"
            className={styles.pageButton}
            disabled={offset + PAGE_SIZE >= total}
            onClick={() => setOffset((current) => current + PAGE_SIZE)}
          >
            {t('articles.list.next', 'Next')}
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminArticleList
