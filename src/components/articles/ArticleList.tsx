import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import articleService, { type Article } from '../../services/articleService'
import { WorkflowStatusBadge } from './WorkflowStatusBadge'
import './ArticleList.css'

interface ArticleListProps {
  filters?: {
    status?: string
    author_id?: number
  }
  usePublicEndpoint?: boolean // Use public endpoint (only published articles)
}

export function ArticleList({ filters, usePublicEndpoint = true }: ArticleListProps) {
  const { i18n } = useTranslation()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    loadArticles()
  }, [page, filters, usePublicEndpoint, i18n.language])

  const loadArticles = async () => {
    setLoading(true)
    try {
      const languageCode = i18n.language || 'pt-BR'
      
      // Use public endpoint if no specific filters or if explicitly requested
      if (usePublicEndpoint && (!filters || (!filters.status && !filters.author_id))) {
        const response = await articleService.listPublicArticles(
          languageCode,
          limit,
          (page - 1) * limit
        )
        // Ensure articles is always an array
        const articlesArray = Array.isArray(response?.articles) ? response.articles : []
        setArticles(articlesArray)
        setTotal(response?.total ?? 0)
      } else {
        // Use protected endpoint for filtered/admin views
        const response = await articleService.listArticles({
          ...filters,
          limit,
          offset: (page - 1) * limit,
        })
        // Ensure articles is always an array
        const articlesArray = Array.isArray(response?.articles) ? response.articles : []
        setArticles(articlesArray)
        setTotal(response?.total ?? 0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar artigos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="article-list">
      <div className="article-list-header">
        <h2>Artigos</h2>
        {!usePublicEndpoint && (
          <Link to="/articles/new" className="btn-new-article">
            Novo Artigo
          </Link>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum artigo encontrado</p>
          {!usePublicEndpoint && (
            <Link to="/articles/new" className="btn-new-article">
              Criar Primeiro Artigo
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="articles-grid">
            {articles.map((article) => {
              const languageCode = i18n.language || 'pt-BR'
              const translation = article.translations?.[languageCode] || 
                                  article.translations?.['pt-BR'] || 
                                  Object.values(article.translations || {})[0]
              const articleSlug = article.slug || article.id
              
              return (
                <div key={article.id} className="article-card">
                  <div className="article-card-header">
                    {!usePublicEndpoint && <WorkflowStatusBadge status={article.status} />}
                    <span className="article-date">
                      {new Date(article.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h3 className="article-card-title">
                    <Link to={usePublicEndpoint ? `/articles/${articleSlug}` : `/articles/${article.id}/edit`}>
                      {translation?.title || 'Sem título'}
                    </Link>
                  </h3>
                  {translation?.excerpt && (
                    <p className="article-card-excerpt">{translation.excerpt}</p>
                  )}
                  <div className="article-card-footer">
                    {usePublicEndpoint ? (
                      <Link to={`/articles/${articleSlug}`} className="btn-read">
                        Ler mais
                      </Link>
                    ) : (
                      <Link to={`/articles/${article.id}/edit`} className="btn-edit">
                        Editar
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
              <span>
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
