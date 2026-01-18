import { useQuery } from '@tanstack/react-query'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import { useSmartPolling } from './useSmartPolling'

interface SyncMetrics {
  lastSyncTime: string
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  postsSynced: number
  actorsSynced: number
  averageSyncTime: number
  lastError?: string
}

interface SecurityMetrics {
  totalRequests: number
  blockedRequests: number
  rateLimitHits: number
  invalidSignatures: number
  replayAttempts: number
  requestsByInstance: Record<string, number>
}

interface DatabaseStats {
  posts: number
  actors: number
  followers: number
  unreadNotifications: number
}

// Query keys for React Query
export const metricsKeys = {
  all: ['metrics'] as const,
  sync: () => [...metricsKeys.all, 'sync'] as const,
  security: () => [...metricsKeys.all, 'security'] as const,
  database: () => [...metricsKeys.all, 'database'] as const,
}

// Fetch functions
const fetchSyncMetrics = async (): Promise<SyncMetrics | null> => {
  const response = await fetch(apiUrl(API_ENDPOINTS.microblog.metrics.sync))
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`Failed to fetch sync metrics: ${response.status}`)
  }
  return response.json()
}

const fetchSecurityMetrics = async (): Promise<SecurityMetrics | null> => {
  const response = await fetch(apiUrl(API_ENDPOINTS.microblog.metrics.security))
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`Failed to fetch security metrics: ${response.status}`)
  }
  return response.json()
}

const fetchDatabaseStats = async (): Promise<DatabaseStats | null> => {
  const response = await fetch(apiUrl(API_ENDPOINTS.microblog.metrics.database))
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`Failed to fetch database stats: ${response.status}`)
  }
  return response.json()
}

/**
 * Hook for sync metrics with smart polling
 * Updates every 10 seconds when tab is visible
 */
export function useSyncMetrics(enabled = true) {
  const query = useQuery({
    queryKey: metricsKeys.sync(),
    queryFn: fetchSyncMetrics,
    enabled,
    staleTime: 5000, // Consider stale after 5 seconds
  })

  // Smart polling: only when enabled and tab is visible
  useSmartPolling({
    callback: () => {
      void query.refetch()
    },
    interval: 10000, // 10 seconds (faster than before)
    enabled: enabled && query.isSuccess,
    pauseWhenHidden: true,
  })

  return query
}

/**
 * Hook for security metrics with smart polling
 */
export function useSecurityMetrics(enabled = true) {
  const query = useQuery({
    queryKey: metricsKeys.security(),
    queryFn: fetchSecurityMetrics,
    enabled,
    staleTime: 5000,
  })

  useSmartPolling({
    callback: () => {
      void query.refetch()
    },
    interval: 10000,
    enabled: enabled && query.isSuccess,
    pauseWhenHidden: true,
  })

  return query
}

/**
 * Hook for database stats with smart polling
 */
export function useDatabaseStats(enabled = true) {
  const query = useQuery({
    queryKey: metricsKeys.database(),
    queryFn: fetchDatabaseStats,
    enabled,
    staleTime: 5000,
  })

  useSmartPolling({
    callback: () => {
      void query.refetch()
    },
    interval: 10000,
    enabled: enabled && query.isSuccess,
    pauseWhenHidden: true,
  })

  return query
}

/**
 * Combined hook for all metrics
 */
export function useAllMetrics(enabled = true) {
  const sync = useSyncMetrics(enabled)
  const security = useSecurityMetrics(enabled)
  const database = useDatabaseStats(enabled)

  return {
    sync,
    security,
    database,
    isLoading: sync.isLoading || security.isLoading || database.isLoading,
    isError: sync.isError || security.isError || database.isError,
  }
}
