import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ArticleList } from '../components/articles/ArticleList'
import { ArticleTypeFilter } from '../components/articles/ArticleTypeFilter'
import {
  articleTypeDescription,
  articleTypeLabel,
} from '../components/articles/articleTypeLabel'
import { useArticleTypes } from '../hooks/useArticleTypes'
import { useSEO, useStructuredData } from '../hooks/useSEO'
import styles from './ArticlesByType.module.css'

export function ArticlesByType() {
  const { typeSlug } = useParams<{ typeSlug: string }>()
  const { t, i18n } = useTranslation()
  const { types, loading } = useArticleTypes()
  const language = i18n.language || 'pt-BR'

  const articleType = types.find((candidate) => candidate.slug === typeSlug)

  // Only once the vocabulary has arrived: until then an unknown slug is
  // indistinguishable from one that simply has not loaded, and showing "not
  // found" during loading would flash an error on every visit.
  const unknown = !loading && !articleType

  const label = articleType ? articleTypeLabel(articleType, language) : typeSlug || ''
  const description = articleType ? articleTypeDescription(articleType, language) : ''

  const seo = useMemo(
    () => ({
      title: `${label} - From Abyss Media`,
      description: description || undefined,
      url: `https://fromabyss.com/articles/type/${typeSlug || ''}`,
      type: 'website',
    }),
    [label, description, typeSlug],
  )

  useSEO(seo)

  useStructuredData(
    'CollectionPage',
    useMemo(
      () => ({
        name: label,
        description: description || undefined,
        url: `https://fromabyss.com/articles/type/${typeSlug || ''}`,
        inLanguage: language,
        isPartOf: { '@type': 'WebSite', name: 'From Abyss Media', url: 'https://fromabyss.com/' },
      }),
      [label, description, typeSlug, language],
    ),
  )

  if (unknown) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.title}>{t('articles.type.notFoundTitle', 'Type not found')}</h1>
        <p className={styles.description}>
          {t('articles.type.notFound', 'There is no article type with this address.')}
        </p>
        <Link className={styles.back} to="/articles">
          {t('articles.type.backToAll', 'See all articles')}
        </Link>
      </div>
    )
  }

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>{label}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </header>
      <ArticleTypeFilter value={typeSlug} />
      <ArticleList typeSlug={typeSlug} />
    </div>
  )
}

export default ArticlesByType
