import apiClient from './apiClient'
import { apiUrl } from '../utils/api'
import type { ArticleType } from './articleTypeService'

export interface Article {
  id: string
  slug: string
  author_id: number
  status: 'draft' | 'in_review' | 'reviewed' | 'approved' | 'published' | 'archived'
  featured_asset_id?: string
  og_image_url?: string
  published_at?: string
  created_at: string
  updated_at: string
  /**
   * Absent on every article written before types existed, which today is most
   * of them. Everything that renders it has to tolerate that.
   */
  type?: ArticleType
  translations?: Record<string, ArticleTranslation>
  featured_asset?: ArticleAsset
  assets?: ArticleAsset[]
  tags?: string[]
  topics?: string[]
}

export interface ArticleTranslation {
  id: string
  article_id: string
  language_code: string
  title: string
  subtitle?: string
  excerpt?: string
  content: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
  created_at: string
  updated_at: string
}

export interface ArticleAsset {
  id: string
  article_id: string
  url: string
  alt_text?: string
  is_featured: boolean
  display_order: number
  created_at: string
}

export interface ArticleRevision {
  id: string
  article_id: string
  language_code: string
  content: string
  status: string
  reviewer_id?: number
  notes?: string
  created_at: string
}

export interface ArticleCreateRequest {
  translations: Record<string, ArticleTranslationInput>
  tags?: string[]
  topics?: string[]
  primary_language: 'pt-BR' | 'en-GB'
  og_image_url?: string
  type_slug?: string
}

export interface ArticleTranslationInput {
  title: string
  subtitle?: string
  excerpt?: string
  content: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
}

export interface ArticleUpdateRequest {
  translations?: Record<string, ArticleTranslationInput>
  tags?: string[]
  topics?: string[]
  og_image_url?: string
  /**
   * Three states, and the distinction is load-bearing:
   *
   * - `undefined` leaves the article's type alone. JSON.stringify drops the key
   *   entirely, so an editor that has not finished loading sends nothing and the
   *   server preserves what is already there.
   * - `''` clears the type.
   * - a slug sets it.
   *
   * Typing this as `string` instead would collapse the first two states and a
   * half-loaded editor would silently untype the article on the next save.
   */
  type_slug?: string
}

export interface ArticleStatusUpdateRequest {
  status: 'draft' | 'in_review' | 'reviewed' | 'approved' | 'published' | 'archived'
  notes?: string
}

export interface ArticleListFilters {
  status?: string
  author_id?: number
  tags?: string[]
  topics?: string[]
  lang?: 'pt-BR' | 'en-GB'
  limit?: number
  offset?: number
}

/**
 * What a reader is allowed to ask for. Deliberately narrower than
 * ArticleListFilters, mirroring the server: the public endpoint has no status
 * or author filter, and this type is how the frontend stops anyone from
 * casually adding one.
 */
export interface PublicArticleListFilters {
  lang?: string
  type?: string
  limit?: number
  offset?: number
}

export interface ArticleListResponse {
  articles: Article[]
  total: number
  limit: number
  offset: number
}

export interface GrammarCheckRequest {
  text: string
  language: 'pt-BR' | 'en-GB'
}

export interface GrammarMatch {
  message: string
  shortMessage: string
  replacements: string[]
  offset: number
  length: number
  context: string
}

export interface GrammarCheckResponse {
  matches: GrammarMatch[]
  language: string
}

class ArticleService {
  /**
   * Create a new article
   */
  async createArticle(data: ArticleCreateRequest): Promise<Article> {
    return apiClient.post<Article>(apiUrl('/v1/articles'), data)
  }

  /**
   * Get article by ID
   */
  async getArticle(id: string, languageCode: string = 'pt-BR'): Promise<Article> {
    return apiClient.get<Article>(apiUrl(`/v1/articles/${id}?lang=${languageCode}`))
  }

  /**
   * Get article by slug
   */
  async getArticleBySlug(slug: string, languageCode: string = 'pt-BR'): Promise<Article> {
    return apiClient.get<Article>(apiUrl(`/v1/articles/slug/${slug}?lang=${languageCode}`))
  }

  /**
   * Update article
   */
  async updateArticle(id: string, data: ArticleUpdateRequest): Promise<Article> {
    return apiClient.put<Article>(apiUrl(`/v1/articles/${id}`), data)
  }

  /**
   * Delete article
   */
  async deleteArticle(id: string): Promise<void> {
    return apiClient.delete(apiUrl(`/v1/articles/${id}`))
  }

  /**
   * Update article status
   */
  async updateStatus(id: string, status: ArticleStatusUpdateRequest): Promise<void> {
    return apiClient.post(apiUrl(`/v1/articles/${id}/status`), status)
  }

  /**
   * Update translation
   */
  async updateTranslation(
    id: string,
    languageCode: string,
    translation: ArticleTranslationInput
  ): Promise<ArticleTranslation> {
    return apiClient.put<ArticleTranslation>(
      apiUrl(`/v1/articles/${id}/translations/${languageCode}`),
      translation
    )
  }

  /**
   * List articles with filters
   */
  async listArticles(filters: ArticleListFilters = {}): Promise<ArticleListResponse> {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.author_id) params.append('author_id', filters.author_id.toString())
    if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','))
    if (filters.topics && filters.topics.length > 0) params.append('topics', filters.topics.join(','))
    if (filters.lang) params.append('lang', filters.lang)
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())

    const queryString = params.toString()
    const url = queryString
      ? apiUrl(`/v1/articles?${queryString}`)
      : apiUrl('/v1/articles')

    return apiClient.get<ArticleListResponse>(url)
  }

  /**
   * List public articles
   */
  async listPublicArticles(filters: PublicArticleListFilters = {}): Promise<ArticleListResponse> {
    const params = new URLSearchParams()
    params.append('lang', filters.lang || 'pt-BR')
    params.append('limit', String(filters.limit ?? 20))
    params.append('offset', String(filters.offset ?? 0))
    if (filters.type) params.append('type', filters.type)

    return apiClient.get<ArticleListResponse>(apiUrl(`/v1/articles/public?${params.toString()}`))
  }

  /**
   * Get public article by slug
   */
  async getPublicArticle(slug: string, languageCode: string = 'pt-BR'): Promise<Article> {
    return apiClient.get<Article>(apiUrl(`/v1/articles/public/${slug}?lang=${languageCode}`))
  }

  /**
   * Upload asset image
   */
  async uploadAsset(articleId: string, file: File, altText?: string, isFeatured: boolean = false): Promise<ArticleAsset> {
    const formData = new FormData()
    formData.append('file', file)
    if (altText) formData.append('alt_text', altText)
    formData.append('is_featured', isFeatured.toString())

    return apiClient.upload<ArticleAsset>(apiUrl(`/v1/articles/${articleId}/assets/upload`), formData)
  }

  /**
   * Add asset
   */
  async addAsset(articleId: string, asset: {
    url: string
    alt_text?: string
    is_featured?: boolean
    display_order?: number
  }): Promise<ArticleAsset> {
    return apiClient.post<ArticleAsset>(apiUrl(`/v1/articles/${articleId}/assets`), asset)
  }

  /**
   * Set featured asset
   */
  async setFeaturedAsset(articleId: string, assetId: string): Promise<void> {
    return apiClient.put(apiUrl(`/v1/articles/${articleId}/assets/${assetId}/featured`), {})
  }

  /**
   * Remove asset
   */
  async removeAsset(articleId: string, assetId: string): Promise<void> {
    return apiClient.delete(apiUrl(`/v1/articles/${articleId}/assets/${assetId}`))
  }

  /**
   * Add tag
   */
  async addTag(articleId: string, tag: string): Promise<void> {
    return apiClient.post(apiUrl(`/v1/articles/${articleId}/tags`), { tag })
  }

  /**
   * Remove tag
   */
  async removeTag(articleId: string, tag: string): Promise<void> {
    return apiClient.delete(apiUrl(`/v1/articles/${articleId}/tags/${tag}`))
  }

  /**
   * Add topic
   */
  async addTopic(articleId: string, topic: string): Promise<void> {
    return apiClient.post(apiUrl(`/v1/articles/${articleId}/topics`), { topic })
  }

  /**
   * Remove topic
   */
  async removeTopic(articleId: string, topic: string): Promise<void> {
    return apiClient.delete(apiUrl(`/v1/articles/${articleId}/topics/${topic}`))
  }

  /**
   * Get revisions
   */
  async getRevisions(articleId: string): Promise<ArticleRevision[]> {
    return apiClient.get<ArticleRevision[]>(apiUrl(`/v1/articles/${articleId}/revisions`))
  }

  /**
   * Check grammar
   */
  async checkGrammar(text: string, language: 'pt-BR' | 'en-GB'): Promise<GrammarCheckResponse> {
    return apiClient.post<GrammarCheckResponse>(apiUrl('/v1/articles/check-grammar'), {
      text,
      language,
    })
  }
}

export const articleService = new ArticleService()
export default articleService
