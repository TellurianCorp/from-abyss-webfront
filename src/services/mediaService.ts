import apiClient from './apiClient'
import { apiUrl } from '../utils/api'

export type MediaType = 'image' | 'audio' | 'video'

export interface MediaItem {
  id: string
  media_type: MediaType
  mime_type: string
  url?: string
  thumbnail_url?: string
  original_filename?: string
  title?: string
  alt_text?: string
  caption?: string
  width?: number
  height?: number
  duration_seconds?: number
  file_size_bytes: number
  status: 'pending' | 'ready' | 'failed'
  uploaded_by: number
  created_at: string
  updated_at: string
}

export interface MediaListFilters {
  media_type?: MediaType
  q?: string
  mine?: boolean
  limit?: number
  offset?: number
}

export interface MediaListResponse {
  items: MediaItem[]
  total: number
  limit: number
  offset: number
}

export interface MediaUpdateRequest {
  title?: string
  alt_text?: string
  caption?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

export interface UploadOptions {
  altText?: string
  title?: string
  onProgress?: (progress: UploadProgress) => void
  signal?: AbortSignal
}

/**
 * Client-side limits, matching internal/storage/media.go.
 *
 * Checked before anything is sent so a writer who picked a 400 MB video is told
 * immediately rather than after uploading it. The server enforces the same
 * limits; this only saves the round trip.
 */
export const MEDIA_LIMITS: Record<MediaType, { maxBytes: number; mimeTypes: readonly string[] }> = {
  image: {
    maxBytes: 15 * 1024 * 1024,
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
  },
  audio: {
    maxBytes: 200 * 1024 * 1024,
    mimeTypes: [
      'audio/mpeg',
      'audio/mp4',
      'audio/aac',
      'audio/ogg',
      'audio/wav',
      'audio/webm',
      'audio/flac',
    ],
  },
  video: {
    maxBytes: 500 * 1024 * 1024,
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  },
}

/** Browser spellings the server normalises; accepted here so the guard agrees. */
const MIME_ALIASES: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'image/x-png': 'image/png',
  'audio/mp3': 'audio/mpeg',
  'audio/x-m4a': 'audio/mp4',
  'audio/m4a': 'audio/mp4',
  'audio/x-wav': 'audio/wav',
  'audio/wave': 'audio/wav',
  'audio/x-flac': 'audio/flac',
  'video/x-m4v': 'video/mp4',
}

export function normalizeMimeType(mimeType: string): string {
  const base = mimeType.split(';')[0]?.trim().toLowerCase() ?? ''
  return MIME_ALIASES[base] ?? base
}

export function mediaTypeFor(mimeType: string): MediaType | null {
  const normalized = normalizeMimeType(mimeType)

  for (const [type, spec] of Object.entries(MEDIA_LIMITS)) {
    if (spec.mimeTypes.includes(normalized)) return type as MediaType
  }

  return null
}

export type ValidationResult =
  | { ok: true; mediaType: MediaType }
  | { ok: false; reason: 'type' | 'size'; limitBytes?: number }

export function validateFile(file: File, accept?: MediaType): ValidationResult {
  const mediaType = mediaTypeFor(file.type)

  if (!mediaType) return { ok: false, reason: 'type' }
  if (accept && mediaType !== accept) return { ok: false, reason: 'type' }

  const { maxBytes } = MEDIA_LIMITS[mediaType]
  if (file.size > maxBytes) return { ok: false, reason: 'size', limitBytes: maxBytes }

  return { ok: true, mediaType }
}

/**
 * Multipart upload over XHR.
 *
 * fetch cannot report upload progress, and apiClient is fetch-based. Rather
 * than rework apiClient for its one caller that needs progress, the exception
 * is isolated here. withCredentials is the XHR equivalent of
 * credentials: 'include', and is just as necessary: the API authenticates by
 * session cookie.
 */
function xhrUpload<T>(url: string, formData: FormData, options: UploadOptions = {}): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const request = new XMLHttpRequest()

    request.open('POST', url)
    request.withCredentials = true
    // Content-Type is deliberately not set: only the browser knows the
    // multipart boundary.

    if (options.onProgress) {
      request.upload.onprogress = (event) => {
        if (!event.lengthComputable) return
        options.onProgress?.({
          loaded: event.loaded,
          total: event.total,
          percent: Math.round((event.loaded / event.total) * 100),
        })
      }
    }

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        try {
          resolve(JSON.parse(request.responseText) as T)
        } catch {
          reject(new Error('The server returned a response that could not be read.'))
        }
        return
      }

      reject(new Error(readErrorMessage(request)))
    }

    request.onerror = () => reject(new Error('The upload could not reach the server.'))
    request.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'))

    options.signal?.addEventListener('abort', () => request.abort(), { once: true })

    request.send(formData)
  })
}

/** Surfaces the API's own message, which explains far more than a status code. */
function readErrorMessage(request: XMLHttpRequest): string {
  try {
    const body = JSON.parse(request.responseText) as { message?: string; error?: string }
    const message = body.message ?? body.error
    if (message) return message
  } catch {
    // Fall through to the generic message.
  }

  if (request.status === 503) {
    return 'Media storage is not configured on this environment.'
  }

  return `Upload failed (${request.status}).`
}

class MediaService {
  async list(filters: MediaListFilters = {}): Promise<MediaListResponse> {
    const params = new URLSearchParams()
    if (filters.media_type) params.set('media_type', filters.media_type)
    if (filters.q) params.set('q', filters.q)
    if (filters.mine) params.set('mine', 'true')
    if (filters.limit !== undefined) params.set('limit', String(filters.limit))
    if (filters.offset !== undefined) params.set('offset', String(filters.offset))

    const query = params.toString()
    return apiClient.get<MediaListResponse>(apiUrl(query ? `/v1/media?${query}` : '/v1/media'))
  }

  async get(id: string): Promise<MediaItem> {
    return apiClient.get<MediaItem>(apiUrl(`/v1/media/${id}`))
  }

  async upload(file: File, options: UploadOptions = {}): Promise<MediaItem> {
    const formData = new FormData()
    formData.append('file', file)
    if (options.altText) formData.append('alt_text', options.altText)
    if (options.title) formData.append('title', options.title)

    return xhrUpload<MediaItem>(apiUrl('/v1/media/upload'), formData, options)
  }

  async update(id: string, data: MediaUpdateRequest): Promise<MediaItem> {
    return apiClient.patch<MediaItem>(apiUrl(`/v1/media/${id}`), data)
  }

  async remove(id: string): Promise<void> {
    return apiClient.delete(apiUrl(`/v1/media/${id}`))
  }
}

export const mediaService = new MediaService()
export default mediaService
