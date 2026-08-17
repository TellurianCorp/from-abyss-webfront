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

import { apiUrl } from '../utils/api'

export interface ApiError {
  status: number
  statusText: string
  message: string
  details?: unknown
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

  // No baseUrl parameter: the class never used one. URLs are built by apiUrl(),
  // which resolves the base from the environment, so a constructor argument only
  // advertised a configurability that did not exist.
  constructor() {
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
    const headers: Record<string, string> = {
      ...(this.defaultHeaders as Record<string, string>),
      ...(fetchOptions.headers as Record<string, string> | undefined),
    }

    // FormData must set its own Content-Type, because only the browser knows the
    // multipart boundary. upload() deletes the header, but the merge above
    // reinstates the JSON default over it, so the check has to live here: every
    // multipart body was going out declared as JSON with no boundary, which the
    // server cannot parse.
    if (fetchOptions.body instanceof FormData) {
      delete headers['Content-Type']
    }

    let config: RequestInit = {
      // Session cookies are the only authentication the API accepts. Set before
      // the interceptors run so an interceptor cannot drop it by spreading over
      // the config.
      credentials: 'include',
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
      return await interceptedResponse.text() as unknown as T
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
    data?: unknown,
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
    data?: unknown,
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
    data?: unknown,
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
    // Content-Type is stripped in request(), which is the only place that can do
    // it: the default headers are merged in there and would otherwise reinstate
    // the JSON type over anything removed here.
    const { headers, ...restOptions } = options
    const uploadHeaders = headers ? { ...headers } : {}
    delete (uploadHeaders as Record<string, unknown>)['Content-Type']

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

// Authentication is the session cookie, attached by credentials: 'include' in
// request(). There is deliberately no bearer-token interceptor here: the one
// that used to live at this spot read localStorage['auth_token'], a key nothing
// in this codebase ever writes, and the API has no bearer-token path at all -
// its middleware reads the session_id cookie and nothing else.

// Add response logging interceptor (development only)
if (import.meta.env.DEV) {
  apiClient.addResponseInterceptor((response) => {
    console.log(`[API] ${response.url} - ${response.status} ${response.statusText}`)
    return response
  })
}

// Export default instance
export default apiClient
