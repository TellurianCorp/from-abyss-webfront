import apiClient from './apiClient'
import { apiUrl } from '../utils/api'

/**
 * A label in every language the site serves.
 *
 * The server sends the whole map rather than resolving a string, so switching
 * language is instant and, more importantly, so a name edited in the admin
 * screen is what readers actually see. Resolving server-side would have been
 * fine; keeping a copy of the labels in the locale files would not, because a
 * locale key would silently win over the field an admin just edited.
 */
export type LocalizedText = Record<string, string>

export interface ArticleType {
  id: string
  slug: string
  name: LocalizedText
  description: LocalizedText
  display_order: number
  created_at: string
  updated_at: string
}

export interface ArticleTypeCreateRequest {
  slug: string
  name: LocalizedText
  description?: LocalizedText
  display_order?: number
}

/**
 * No slug: it is immutable by design, because it appears verbatim in
 * /articles/type/<slug> and renaming it would break links already in the world.
 */
export interface ArticleTypeUpdateRequest {
  name?: LocalizedText
  description?: LocalizedText
  display_order?: number
}

export interface ArticleTypeListResponse {
  types: ArticleType[]
}

export interface ArticleTypeRetireResponse {
  retired: boolean
  /** How many articles keep rendering this type's badge after retirement. */
  articles_affected: number
}

class ArticleTypeService {
  /** The live vocabulary, in display order. Public. */
  async listTypes(): Promise<ArticleType[]> {
    const response = await apiClient.get<ArticleTypeListResponse>(apiUrl('/v1/article-types'))
    return Array.isArray(response?.types) ? response.types : []
  }

  async createType(data: ArticleTypeCreateRequest): Promise<ArticleType> {
    return apiClient.post<ArticleType>(apiUrl('/v1/admin/article-types'), data)
  }

  async updateType(id: string, data: ArticleTypeUpdateRequest): Promise<ArticleType> {
    return apiClient.patch<ArticleType>(apiUrl(`/v1/admin/article-types/${id}`), data)
  }

  /**
   * Retires a type. Never a deletion: articles already carrying it keep
   * rendering their badge, and it simply stops being offered for new work.
   */
  async retireType(id: string): Promise<ArticleTypeRetireResponse> {
    return apiClient.delete<ArticleTypeRetireResponse>(apiUrl(`/v1/admin/article-types/${id}`))
  }

  /**
   * Brings a retired type back. Creating one whose slug matches a retired type
   * restores it too, so this exists for the admin screen to offer it directly
   * rather than making someone retype the labels.
   */
  async restoreType(id: string): Promise<void> {
    return apiClient.post(apiUrl(`/v1/admin/article-types/${id}/restore`), {})
  }
}

export const articleTypeService = new ArticleTypeService()
export default articleTypeService
