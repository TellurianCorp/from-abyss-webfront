import { useMemo } from 'react'

import { sanitizeArticleHtml } from './sanitizeArticleHtml'
// The same sheet the editing surface loads, so what an author saw is what a
// reader gets.
import '../../styles/article-content.css'

export interface ArticleContentProps {
  html: string
  className?: string
}

/**
 * Renders article body HTML.
 *
 * The single place article content reaches the DOM, so the sanitizing pass has
 * exactly one place to live. The API sanitizes on write, but rows written before
 * that shipped are still unsanitized until the backfill runs, and a read-path
 * guard costs one pass over a string in a useMemo.
 */
export function ArticleContent({ html, className }: ArticleContentProps) {
  const clean = useMemo(() => sanitizeArticleHtml(html), [html])

  return (
    <div
      className={className ? `fa-article ${className}` : 'fa-article'}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}

export default ArticleContent
