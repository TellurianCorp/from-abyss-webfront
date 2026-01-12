/**
 * API Client with comprehensive error handling and type safety
 *
 * Features:
 * - Centralized error handling
 * - Type-safe request/response
 * - Automatic JSON parsing
 * - Request/response interceptors
 * - Retry logic for failed requests
 * - Loading state management
 */

import { API_BASE_URL, apiUrl } from '../utils/api'

export interface ApiError {
  status: number
  statusText: string
  message: string
  details?: any
}

export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
  loading: boolean
}

export interface RequestOptions extends RequestInit {
  retry?: number
  retryDelay?: number
  timeout?: number
}

class ApiClient {
  private defaultHeaders: HeadersInit
  private requestInterceptors: Array<(config: RequestInit) => RequestInit> = []
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = []

  constructor(_baseUrl: string = API_BASE_URL) {
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: (config: RequestInit) => RequestInit): void {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>): void {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * Apply request interceptors
   */
  private applyRequestInterceptors(config: RequestInit): RequestInit {
    return this.requestInterceptors.reduce((cfg, interceptor) => interceptor(cfg), config)
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let res = response
    for (const interceptor of this.responseInterceptors) {
      res = await interceptor(res)
    }
    return res
  }

  /**
   * Make an HTTP request with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      retry = 0,
      retryDelay = 1000,
      timeout = 30000,
      ...fetchOptions
    } = options

    const url = endpoint.startsWith('http') ? endpoint : apiUrl(endpoint)

    // Merge default headers with custom headers
    const headers = {
      ...this.defaultHeaders,
      ...fetchOptions.headers,
    }

    let config: RequestInit = {
      ...fetchOptions,
      headers,
    }

    // Apply request interceptors
    config = this.applyRequestInterceptors(config)

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Apply response interceptors
      const interceptedResponse = await this.applyResponseInterceptors(response)

      // Handle HTTP errors
      if (!interceptedResponse.ok) {
        const error = await this.handleErrorResponse(interceptedResponse)

        // Retry logic for 5xx errors and network errors
        if (retry > 0 && interceptedResponse.status >= 500) {
          await this.sleep(retryDelay)
          return this.request<T>(endpoint, { ...options, retry: retry - 1 })
        }

        throw error
      }

      // Parse JSON response
      const contentType = interceptedResponse.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await interceptedResponse.json()
      }

      // Return text for non-JSON responses
      return await interceptedResponse.text() as any
    } catch (error) {
      clearTimeout(timeoutId)

      // Handle abort/timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw {
          status: 408,
          statusText: 'Request Timeout',
          message: 'Request timed out',
        } as ApiError
      }

      // Handle network errors
      if (error instanceof TypeError) {
        // Retry on network errors
        if (retry > 0) {
          await this.sleep(retryDelay)
          return this.request<T>(endpoint, { ...options, retry: retry - 1 })
        }

        throw {
          status: 0,
          statusText: 'Network Error',
          message: 'Network request failed. Please check your connection.',
          details: error.message,
        } as ApiError
      }

      // Re-throw API errors
      throw error
    }
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<ApiError> {
    let errorMessage = response.statusText
    let errorDetails

    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
      errorDetails = errorData
    } catch {
      // If JSON parsing fails, use text
      try {
        errorMessage = await response.text()
      } catch {
        // Ignore text parsing errors
      }
    }

    return {
      status: response.status,
      statusText: response.statusText,
      message: errorMessage,
      details: errorDetails,
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }

  /**
   * Upload file with multipart/form-data
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    options: RequestOptions = {}
  ): Promise<T> {
    // Remove Content-Type header to let browser set it with boundary
    const { headers, ...restOptions } = options
    const uploadHeaders = headers ? { ...headers } : {}
    delete (uploadHeaders as any)['Content-Type']

    return this.request<T>(endpoint, {
      ...restOptions,
      method: 'POST',
      headers: uploadHeaders,
      body: formData,
    })
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Add authentication interceptor
apiClient.addRequestInterceptor((config) => {
  // Add authentication token if available
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    }
  }
  return config
})

// Add response logging interceptor (development only)
if (import.meta.env.DEV) {
  apiClient.addResponseInterceptor((response) => {
    console.log(`[API] ${response.url} - ${response.status} ${response.statusText}`)
    return response
  })
}

// Export default instance
export default apiClient
