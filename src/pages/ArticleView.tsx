import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import articleService, { type Article } from '../services/articleService'
import { ArticleContent } from '../components/articles/ArticleContent'
import { ArticleTypeBadge } from '../components/articles/ArticleTypeBadge'
import { articleTypeLabel } from '../components/articles/articleTypeLabel'
import { useSEO, useStructuredData } from '../hooks/useSEO'
import './ArticleView.css'

export function ArticleView() {
  const { slug } = useParams<{ slug: string }>()
  const { t, i18n } = useTranslation()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      loadArticle()
    }
  }, [slug, i18n.language])

  const language = i18n.language || 'pt-BR'
  const translation = article?.translations?.[language] ||
                      Object.values(article?.translations || {})[0]

  // Every article page served the site's default title and description until
  // now: nothing here emitted SEO at all, even though the editor has collected
  // meta_title, meta_description and og_image_url all along. Built with useMemo
  // because useSEO depends on object identity and a fresh object every render
  // would rewrite the document head on each one.
  const seo = useMemo(() => {
    if (!article || !translation) return {}
    const canonical = `https://fromabyss.com/articles/${article.slug}`
    return {
      title: `${translation.meta_title || translation.title} - From Abyss Media`,
      description: translation.meta_description || translation.excerpt || undefined,
      keywords: translation.meta_keywords?.join(', ') || undefined,
      image: article.og_image_url || article.featured_asset?.url || undefined,
      url: canonical,
      type: 'article',
    }
  }, [article, translation])

  useSEO(seo)

  // articleSection is schema.org's field for the section of a publication a
  // piece belongs to, which is exactly what an editorial type is. It is where
  // the classification earns its keep beyond the badge.
  useStructuredData('Article', useMemo(() => {
    if (!article || !translation) return {}
    return {
      headline: translation.title,
      description: translation.meta_description || translation.excerpt || undefined,
      image: article.og_image_url || article.featured_asset?.url || undefined,
      datePublished: article.published_at || article.created_at,
      dateModified: article.updated_at,
      inLanguage: translation.language_code || language,
      articleSection: article.type ? articleTypeLabel(article.type, language) : undefined,
      publisher: { '@type': 'Organization', name: 'From Abyss Media' },
      mainEntityOfPage: `https://fromabyss.com/articles/${article.slug}`,
    }
  }, [article, translation, language]))

  const loadArticle = async () => {
    if (!slug) return

    setLoading(true)
    try {
      const languageCode = i18n.language || 'pt-BR'
      const loadedArticle = await articleService.getPublicArticle(slug, languageCode)
      setArticle(loadedArticle)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Artigo não encontrado')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="article-view-loading">{t('articles.view.loading', 'Loading...')}</div>
  }

  if (error || !article) {
    return <div className="article-view-error">{error || 'Artigo não encontrado'}</div>
  }

  if (!translation) {
    return <div className="article-view-error">Tradução não disponível</div>
  }

  return (
    <article className="article-view">
      {article.featured_asset && (
        <div className="article-hero">
          <img
            src={article.featured_asset.url}
            alt={article.featured_asset.alt_text || translation.title}
          />
        </div>
      )}

      <div className="article-content">
        <header className="article-header">
          <h1>{translation.title}</h1>
          {translation.subtitle && <h2 className="article-subtitle">{translation.subtitle}</h2>}
          <div className="article-meta">
            <ArticleTypeBadge type={article.type} linked />
            <span className="article-date">
              {article.published_at
                ? new Date(article.published_at).toLocaleDateString(i18n.language, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : new Date(article.created_at).toLocaleDateString(i18n.language, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
            </span>
          </div>
        </header>

        {translation.excerpt && (
          <div className="article-excerpt">{translation.excerpt}</div>
        )}

        <ArticleContent html={translation.content} className="article-body" />

        {article.assets && article.assets.length > 0 && (
          <div className="article-assets-gallery">
            <h3>Galeria de Imagens</h3>
            <div className="assets-grid">
              {article.assets.map((asset) => (
                <img
                  key={asset.id}
                  src={asset.url}
                  alt={asset.alt_text || ''}
                  className="asset-image"
                />
              ))}
            </div>
          </div>
        )}

        {(article.tags && article.tags.length > 0) || (article.topics && article.topics.length > 0) ? (
          <footer className="article-footer">
            {article.tags && article.tags.length > 0 && (
              <div className="article-tags">
                <strong>Tags:</strong>
                {article.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {article.topics && article.topics.length > 0 && (
              <div className="article-topics">
                <strong>Tópicos:</strong>
                {article.topics.map((topic) => (
                  <span key={topic} className="topic">
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </footer>
        ) : null}
      </div>
    </article>
  )
}
