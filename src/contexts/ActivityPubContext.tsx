import { createContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { apiUrl, API_ENDPOINTS } from '../utils/api'

export interface RemoteInstance {
  id: string
  domain: string
  softwareName?: string
  softwareVersion?: string
  totalUsers?: number
  lastSeenAt: string
  status: 'active' | 'unreachable' | 'blocked'
}

export interface FollowRequest {
  id: string
  actorId: string
  actorName: string
  actorHandle: string
  actorAvatar?: string
  actorBio?: string
  domain?: string
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface HighlightedProfile {
  id: string
  username: string
  domain: string
  acct: string
  display_name?: string
  avatar_url?: string
  bio?: string
  is_active: boolean
  protocol: 'activitypub' | 'atproto'
}

export interface FederationStatus {
  totalInstances: number
  activeInstances: number
  totalRemoteFollowers: number
  totalRemoteFollowing: number
  recentActivityCount: number
  lastSyncAt?: string
  isHealthy: boolean
}

export interface FederationStats {
  postsReceived24h: number
  postsSent24h: number
  newFollowers24h: number
  newFollowing24h: number
  totalReach: number
}

export interface FederationActivity {
  id: string
  type: 'follow' | 'like' | 'repost' | 'reply' | 'post'
  actorName: string
  actorHandle: string
  actorAvatar?: string
  targetId?: string
  targetType?: string
  createdAt: string
  domain: string
}

export interface ActivityPubContextType {
  federationStatus: FederationStatus | null
  remoteInstances: RemoteInstance[]
  followRequests: FollowRequest[]
  highlightedProfiles: HighlightedProfile[]
  stats: FederationStats | null
  recentActivity: FederationActivity[]
  loading: boolean
  error: string | null
  approveFollow: (id: string) => Promise<void>
  rejectFollow: (id: string) => Promise<void>
  syncFederation: () => Promise<void>
  refreshStatus: () => Promise<void>
  refreshFollowRequests: () => Promise<void>
}

export const ActivityPubContext = createContext<ActivityPubContextType | undefined>(undefined)

interface ActivityPubProviderProps {
  children: ReactNode
}

export function ActivityPubProvider({ children }: ActivityPubProviderProps) {
  const [federationStatus, setFederationStatus] = useState<FederationStatus | null>(null)
  const [remoteInstances, setRemoteInstances] = useState<RemoteInstance[]>([])
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([])
  const [highlightedProfiles, setHighlightedProfiles] = useState<HighlightedProfile[]>([])
  const [stats, setStats] = useState<FederationStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<FederationActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch federation status
  const fetchFederationStatus = useCallback(async () => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.activitypub.federationStatus), {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setFederationStatus(data)
      }
    } catch (err) {
      console.error('Error fetching federation status:', err)
    }
  }, [])

  // Fetch remote instances
  const fetchRemoteInstances = useCallback(async () => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.activitypub.remoteInstances), {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setRemoteInstances(data.instances || [])
      }
    } catch (err) {
      console.error('Error fetching remote instances:', err)
    }
  }, [])

  // Fetch follow requests
  const fetchFollowRequests = useCallback(async () => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.activitypub.pendingFollows), {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setFollowRequests(data.requests || data || [])
      }
    } catch (err) {
      console.error('Error fetching follow requests:', err)
    }
  }, [])

  // Fetch highlighted profiles
  const fetchHighlightedProfiles = useCallback(async () => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.feediverse.highlightedProfiles))

      if (response.ok) {
        const data = await response.json()
        // API returns { success: true, data: [...], count: ... }
        const profilesArray = Array.isArray(data?.data) ? data.data :
                             Array.isArray(data) ? data : []
        setHighlightedProfiles(profilesArray)
      }
    } catch (err) {
      console.error('Error fetching highlighted profiles:', err)
    }
  }, [])

  // Fetch recent activity
  const fetchRecentActivity = useCallback(async () => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.activitypub.activityLog), {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data.activities || [])
      }
    } catch (err) {
      console.error('Error fetching recent activity:', err)
    }
  }, [])

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        await Promise.allSettled([
          fetchFederationStatus(),
          fetchRemoteInstances(),
          fetchFollowRequests(),
          fetchHighlightedProfiles(),
          fetchRecentActivity()
        ])
      } catch (err) {
        console.error('Error loading ActivityPub data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load federation data')
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Poll for updates every 60 seconds
    const interval = setInterval(() => {
      fetchFederationStatus()
      fetchFollowRequests()
      fetchRecentActivity()
    }, 60000)

    return () => clearInterval(interval)
  }, [fetchFederationStatus, fetchRemoteInstances, fetchFollowRequests, fetchHighlightedProfiles, fetchRecentActivity])

  // Approve follow request
  const approveFollow = useCallback(async (id: string) => {
    try {
      const response = await fetch(
        apiUrl(API_ENDPOINTS.activitypub.approveFollowRequest(id)),
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      if (response.ok) {
        // Remove from follow requests
        setFollowRequests(prev => prev.filter(req => req.id !== id))
        // Refresh federation status
        await fetchFederationStatus()
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to approve follow request')
      }
    } catch (err) {
      console.error('Error approving follow request:', err)
      throw err
    }
  }, [fetchFederationStatus])

  // Reject follow request
  const rejectFollow = useCallback(async (id: string) => {
    try {
      const response = await fetch(
        apiUrl(API_ENDPOINTS.activitypub.rejectFollowRequest(id)),
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      if (response.ok) {
        // Remove from follow requests
        setFollowRequests(prev => prev.filter(req => req.id !== id))
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to reject follow request')
      }
    } catch (err) {
      console.error('Error rejecting follow request:', err)
      throw err
    }
  }, [])

  // Sync federation
  const syncFederation = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(apiUrl(API_ENDPOINTS.activitypub.sync), {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        // Refresh all data after sync
        await Promise.allSettled([
          fetchFederationStatus(),
          fetchRemoteInstances(),
          fetchFollowRequests(),
          fetchRecentActivity()
        ])
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to sync federation')
      }
    } catch (err) {
      console.error('Error syncing federation:', err)
      setError(err instanceof Error ? err.message : 'Failed to sync federation')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchFederationStatus, fetchRemoteInstances, fetchFollowRequests, fetchRecentActivity])

  // Refresh status
  const refreshStatus = useCallback(async () => {
    await fetchFederationStatus()
  }, [fetchFederationStatus])

  // Refresh follow requests
  const refreshFollowRequests = useCallback(async () => {
    await fetchFollowRequests()
  }, [fetchFollowRequests])

  const value: ActivityPubContextType = {
    federationStatus,
    remoteInstances,
    followRequests,
    highlightedProfiles,
    stats,
    recentActivity,
    loading,
    error,
    approveFollow,
    rejectFollow,
    syncFederation,
    refreshStatus,
    refreshFollowRequests,
  }

  return (
    <ActivityPubContext.Provider value={value}>
      {children}
    </ActivityPubContext.Provider>
  )
}
