/**
 * Centralized API configuration
 * 
 * This module provides a consistent way to access the API base URL across the application.
 * 
 * Configuration priority:
 * 1. VITE_API_BASE_URL environment variable
 * 2. VITE_API_URL environment variable (fallback)
 * 3. Empty string (uses relative paths, works with Vite proxy in dev)
 * 
 * Environments:
 * - Development (local): Uses Vite proxy to route /v1/* to http://localhost:8080
 * - Development (Docker): Uses Vite proxy to route /v1/* to http://api:8080
 * - Production: VITE_API_BASE_URL should be set to https://api.fromabyss.com
 */

/**
 * Get the API base URL from environment variables or use relative paths
 * 
 * In production, VITE_API_BASE_URL should be set to https://api.fromabyss.com
 * In development, leave it empty to use Vite proxy
 */
export const getApiBaseUrl = (): string => {
  // Check for environment variables first
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
  
  if (envBaseUrl) {
    // Remove trailing slash if present
    return envBaseUrl.replace(/\/$/, '')
  }
  
  // In production mode, if no base URL is set, default to production API
  if (import.meta.env.PROD) {
    // Production default: api.fromabyss.com
    return 'https://api.fromabyss.com'
  }
  
  // Development: return empty string to use relative paths with Vite proxy
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
    createPost: '/v1/microblog/posts',
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
    highlightedProfiles: '/v1/feediverse/highlighted-profiles',
    admin: {
      instances: '/v1/admin/feediverse/instances',
      highlightedProfiles: {
        base: '/v1/admin/feediverse/highlighted-profiles',
        list: '/v1/admin/feediverse/highlighted-profiles',
        create: '/v1/admin/feediverse/highlighted-profiles',
        get: (id: string) => `/v1/admin/feediverse/highlighted-profiles/${id}`,
        update: (id: string) => `/v1/admin/feediverse/highlighted-profiles/${id}`,
        delete: (id: string) => `/v1/admin/feediverse/highlighted-profiles/${id}`,
      },
    },
  },
  // Admin endpoints
  admin: {
    base: '/v1/admin',
    login: '/v1/admin/login',
    logout: '/v1/admin/logout',
    me: '/v1/admin/me',
    users: {
      base: '/v1/admin/users',
      list: '/v1/admin/users',
      create: '/v1/admin/users',
      get: (id: string | number) => `/v1/admin/users/${id}`,
      update: (id: string | number) => `/v1/admin/users/${id}`,
      delete: (id: string | number) => `/v1/admin/users/${id}`,
      uploadPhoto: (id: string | number) => `/v1/admin/users/${id}/photo`,
      createFediverseHandle: (id: string | number) => `/v1/admin/users/${id}/fediverse-handle`,
    },
  },
  // Communication features endpoints
  pitches: {
    base: '/v1/pitches',
    list: '/v1/pitches',
    get: (id: string) => `/v1/pitches/${id}`,
    create: '/v1/pitches',
    update: (id: string) => `/v1/pitches/${id}`,
    delete: (id: string) => `/v1/pitches/${id}`,
  },
  feedback: {
    base: '/v1/feedback',
    create: '/v1/feedback',
    get: (id: string) => `/v1/feedback/${id}`,
    byContent: (contentId: string) => `/v1/feedback/content/${contentId}`,
    byPitch: (pitchId: string) => `/v1/feedback/pitch/${pitchId}`,
    update: (id: string) => `/v1/feedback/${id}`,
    delete: (id: string) => `/v1/feedback/${id}`,
  },
  workflows: {
    base: '/v1/workflows',
    create: '/v1/workflows',
    get: (id: string) => `/v1/workflows/${id}`,
    byContent: (contentId: string) => `/v1/workflows/content/${contentId}`,
    byPitch: (pitchId: string) => `/v1/workflows/pitch/${pitchId}`,
    byAssignee: (assigneeId: string) => `/v1/workflows/assignee/${assigneeId}`,
    update: (id: string) => `/v1/workflows/${id}`,
    delete: (id: string) => `/v1/workflows/${id}`,
  },
} as const
