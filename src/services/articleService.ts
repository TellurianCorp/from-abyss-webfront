import apiClient from './apiClient'
import { apiUrl } from '../utils/api'

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

export interface ArticleCreateRequest {
  translations: Record<string, ArticleTranslationInput>
  tags?: string[]
  topics?: string[]
  primary_language: 'pt-BR' | 'en-GB'
  og_image_url?: string
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
  async listPublicArticles(
    languageCode: string = 'pt-BR',
    limit: number = 20,
    offset: number = 0
  ): Promise<ArticleListResponse> {
    return apiClient.get<ArticleListResponse>(
      apiUrl(`/v1/articles/public?lang=${languageCode}&limit=${limit}&offset=${offset}`)
    )
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
  async getRevisions(articleId: string): Promise<any[]> {
    return apiClient.get<any[]>(apiUrl(`/v1/articles/${articleId}/revisions`))
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
