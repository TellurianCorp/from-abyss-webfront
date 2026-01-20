import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import articleService, { type Article } from '../services/articleService'
import './ArticleView.css'

export function ArticleView() {
  const { slug } = useParams<{ slug: string }>()
  const { i18n } = useTranslation()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      loadArticle()
    }
  }, [slug, i18n.language])

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
    return <div className="article-view-loading">Carregando...</div>
  }

  if (error || !article) {
    return <div className="article-view-error">{error || 'Artigo não encontrado'}</div>
  }

  const translation = article.translations?.[i18n.language || 'pt-BR'] || 
                     Object.values(article.translations || {})[0]

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
            <span className="article-date">
              {article.published_at
                ? new Date(article.published_at).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : new Date(article.created_at).toLocaleDateString('pt-BR', {
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

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: translation.content }}
        />

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
