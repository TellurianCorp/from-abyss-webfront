/**
 * Centralized API configuration
 * 
 * This module provides a consistent way to access the API base URL across the application.
 * 
 * Configuration priority:
 * 1. VITE_API_BASE_URL environment variable
 * 2. VITE_API_URL environment variable (fallback)
 * 3. Empty string (uses relative paths, works with Vite proxy in dev and production routing)
 * 
 * In development, Vite proxy routes /api/* to http://localhost:8080
 * In production, the web server should route API requests appropriately
 */

/**
 * Get the API base URL from environment variables or use relative paths
 */
export const getApiBaseUrl = (): string => {
  // Check for environment variables first
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
  
  if (envBaseUrl) {
    // Remove trailing slash if present
    return envBaseUrl.replace(/\/$/, '')
  }
  
  // Return empty string to use relative paths
  // This works with Vite proxy in dev and production routing
  return ''
}

/**
 * Base API URL - use this for all API calls
 */
export const API_BASE_URL = getApiBaseUrl()

/**
 * Helper function to build API endpoint URLs
 * @param endpoint - API endpoint path (e.g., '/v1/patreon/user' or 'v1/patreon/user')
 * @returns Full API URL
 */
export const apiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  if (API_BASE_URL) {
    // If we have a base URL, use it
    return `${API_BASE_URL}/${cleanEndpoint}`
  }
  
  // Otherwise use relative path (works with proxy/routing)
  return `/${cleanEndpoint}`
}

/**
 * Common API endpoint paths
 */
export const API_ENDPOINTS = {
  // Patreon endpoints
  patreon: {
    base: '/v1/patreon',
    user: '/v1/patreon/user',
    campaigns: '/v1/patreon/campaigns',
    stats: '/v1/patreon/stats',
    cacheClear: '/v1/patreon/cache/clear',
    tiers: (campaignId: string) => `/v1/patreon/campaigns/${campaignId}/tiers`,
    members: (campaignId: string) => `/v1/patreon/campaigns/${campaignId}/members`,
    updateTier: (tierId: string) => `/v1/patreon/tiers/${tierId}`,
  },
  // YouTube endpoints
  youtube: {
    base: '/v1/youtube',
    channel: '/v1/youtube/channel',
    videos: '/v1/youtube/videos',
    stats: '/v1/youtube/stats',
    cacheClear: '/v1/youtube/cache/clear',
  },
  // Microblog endpoints
  microblog: {
    base: '/v1/microblog',
    timeline: '/v1/microblog/timeline',
    likePost: (postId: string) => `/v1/microblog/posts/${postId}/like`,
    follow: '/v1/microblog/follow',
    notifications: {
      base: '/v1/microblog/notifications',
      unreadCount: '/v1/microblog/notifications/unread-count',
      markRead: (notificationId: string) => `/v1/microblog/notifications/${notificationId}/read`,
      markAllRead: '/v1/microblog/notifications/read-all',
    },
    metrics: {
      sync: '/v1/microblog/metrics/sync',
      security: '/v1/microblog/metrics/security',
      database: '/v1/microblog/metrics/database',
    },
  },
  // Feediverse endpoints
  feediverse: {
    base: '/v1/feediverse',
    horror: '/v1/feediverse/horror',
  },
  // Admin endpoints
  admin: {
    base: '/v1/admin',
    login: '/v1/admin/login',
    logout: '/v1/admin/logout',
    me: '/v1/admin/me',
  },
} as const
