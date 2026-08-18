import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { ArticleType } from '../../services/articleTypeService'
import { articleTypeLabel } from './articleTypeLabel'
import styles from './ArticleTypeBadge.module.css'

interface ArticleTypeBadgeProps {
  /** Undefined for every article written before types existed. */
  type?: ArticleType
  /** Links to the type's own page. Off inside anything already clickable. */
  linked?: boolean
  className?: string
}

/**
 * Renders nothing at all when the article has no type -- which today is the
 * common case, not the edge one, since nothing was backfilled. An empty chip or
 * an "Untyped" label would add noise to every existing article.
 */
export function ArticleTypeBadge({ type, linked = false, className }: ArticleTypeBadgeProps) {
  const { i18n } = useTranslation()

  if (!type) return null

  const label = articleTypeLabel(type, i18n.language || 'pt-BR')
  const classes = [styles.badge, className].filter(Boolean).join(' ')

  if (!linked) {
    return <span className={classes}>{label}</span>
  }

  return (
    <Link to={`/articles/type/${type.slug}`} className={`${classes} ${styles.link}`}>
      {label}
    </Link>
  )
}
