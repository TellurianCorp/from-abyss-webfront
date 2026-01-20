import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import './YouTubeManagement.css'

interface ChannelInfo {
  id: string
  title: string
  description: string
  thumbnail: string
  subscribers: number
  videos: number
  views: number
  createdAt: string
  customUrl: string
}

interface VideoInfo {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  duration: string
  viewCount: number
  likeCount: number
  commentCount: number
}

interface ChannelStats {
  subscribers: number
  videos: number
  views: number
  channelId: string
}

export function YouTubeManagement() {
  const { t } = useTranslation()
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null)
  const [videos, setVideos] = useState<VideoInfo[]>([])
  const [stats, setStats] = useState<ChannelStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [cacheStatus, setCacheStatus] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [channelRes, videosRes, statsRes] = await Promise.all([
        fetch(apiUrl(API_ENDPOINTS.youtube.channel)),
        fetch(apiUrl(`${API_ENDPOINTS.youtube.videos}?limit=10`)),
        fetch(apiUrl(API_ENDPOINTS.youtube.stats)),
      ])

      // Check for errors and read error messages
      const errors: string[] = []
      
      if (!channelRes.ok) {
        try {
          const errorData = await channelRes.json()
          errors.push(`Channel: ${errorData.message || errorData.error || `HTTP ${channelRes.status}`}`)
        } catch {
          errors.push(`Channel: HTTP ${channelRes.status}`)
        }
      }
      
      if (!videosRes.ok) {
        try {
          const errorData = await videosRes.json()
          errors.push(`Videos: ${errorData.message || errorData.error || `HTTP ${videosRes.status}`}`)
        } catch {
          errors.push(`Videos: HTTP ${videosRes.status}`)
        }
      }
      
      if (!statsRes.ok) {
        try {
          const errorData = await statsRes.json()
          errors.push(`Stats: ${errorData.message || errorData.error || `HTTP ${statsRes.status}`}`)
        } catch {
          errors.push(`Stats: HTTP ${statsRes.status}`)
        }
      }

      if (errors.length > 0) {
        throw new Error(errors.join('; '))
      }

      const [channelData, videosData, statsData] = await Promise.all([
        channelRes.json(),
        videosRes.json(),
        statsRes.json(),
      ])

      // Handle different response formats
      setChannelInfo(channelData.id ? channelData : channelData.data)
      setVideos(videosData.data || videosData || [])
      setStats(statsData.subscribers !== undefined ? statsData : statsData.data)
    } catch (err) {
      console.error('Error fetching YouTube data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load YouTube data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      setError(null)

      const [channelRes, videosRes, statsRes] = await Promise.all([
        fetch(apiUrl(`${API_ENDPOINTS.youtube.channel}?refresh=true`)),
        fetch(apiUrl(`${API_ENDPOINTS.youtube.videos}?limit=10&refresh=true`)),
        fetch(apiUrl(API_ENDPOINTS.youtube.stats)),
      ])

      // Check for errors and read error messages
      const errors: string[] = []
      
      if (!channelRes.ok) {
        try {
          const errorData = await channelRes.json()
          errors.push(`Channel: ${errorData.message || errorData.error || `HTTP ${channelRes.status}`}`)
        } catch {
          errors.push(`Channel: HTTP ${channelRes.status}`)
        }
      }
      
      if (!videosRes.ok) {
        try {
          const errorData = await videosRes.json()
          errors.push(`Videos: ${errorData.message || errorData.error || `HTTP ${videosRes.status}`}`)
        } catch {
          errors.push(`Videos: HTTP ${videosRes.status}`)
        }
      }
      
      if (!statsRes.ok) {
        try {
          const errorData = await statsRes.json()
          errors.push(`Stats: ${errorData.message || errorData.error || `HTTP ${statsRes.status}`}`)
        } catch {
          errors.push(`Stats: HTTP ${statsRes.status}`)
        }
      }

      if (errors.length > 0) {
        throw new Error(errors.join('; '))
      }

      const [channelData, videosData, statsData] = await Promise.all([
        channelRes.json(),
        videosRes.json(),
        statsRes.json(),
      ])

      // Handle different response formats and map to component interface
      const rawChannel = channelData.id ? channelData : channelData.data
      if (rawChannel) {
        setChannelInfo({
          id: rawChannel.id || '',
          title: rawChannel.name || rawChannel.title || '',
          description: rawChannel.description || '',
          thumbnail: rawChannel.thumbnail || '',
          subscribers: rawChannel.subscribers || 0,
          videos: rawChannel.videoCount || 0,
          views: rawChannel.viewCount || 0,
          createdAt: rawChannel.createdAt || '',
          customUrl: rawChannel.customUrl || '',
        })
      }

      const rawVideos = videosData.data || videosData || []
      setVideos(Array.isArray(rawVideos) ? rawVideos.map((video: any) => ({
        id: video.id || '',
        title: video.title || '',
        description: video.description || '',
        thumbnail: video.thumbnail || '',
        publishedAt: video.publishedAt || '',
        duration: video.duration || '',
        viewCount: video.viewCount || 0,
        likeCount: video.likeCount || 0,
        commentCount: video.commentCount || 0,
      })) : [])

      const rawStats = statsData.subscribers !== undefined ? statsData : statsData.data
      if (rawStats) {
        setStats({
          subscribers: rawStats.subscribers || 0,
          videos: rawStats.totalVideos || rawStats.videos || 0,
          views: rawStats.totalViews || rawStats.views || 0,
          channelId: rawStats.channelId || channelData?.id || '',
        })
      }
      setCacheStatus('Data refreshed successfully')
      setTimeout(() => setCacheStatus(''), 3000)
    } catch (err) {
      console.error('Error refreshing YouTube data:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const handleClearCache = async () => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.youtube.cacheClear), {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to clear cache')
      }

      setCacheStatus('Cache cleared successfully')
      setTimeout(() => setCacheStatus(''), 3000)
      
      // Refresh data after clearing cache
      setTimeout(() => fetchData(), 500)
    } catch (err) {
      console.error('Error clearing cache:', err)
      setCacheStatus('Failed to clear cache')
      setTimeout(() => setCacheStatus(''), 3000)
    }
  }

  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0'
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <section className="admin-panel youtube-management">
        <h3>{t('youtube.admin.title')}</h3>
        <div className="youtube-loading">
          <p>{t('youtube.admin.loading')}</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="admin-panel youtube-management">
        <h3>{t('youtube.admin.title')}</h3>
        <div className="youtube-error">
          <p>{error}</p>
          <button onClick={fetchData} className="youtube-btn youtube-btn-primary">
            {t('youtube.admin.retry')}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-panel youtube-management">
      <div className="youtube-header">
        <h3>{t('youtube.admin.title')}</h3>
        <div className="youtube-actions">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="youtube-btn youtube-btn-primary"
          >
            {refreshing ? t('youtube.admin.refreshing') : t('youtube.admin.refresh')}
          </button>
          <button
            onClick={handleClearCache}
            className="youtube-btn youtube-btn-secondary"
          >
            {t('youtube.admin.clearCache')}
          </button>
        </div>
      </div>

      {cacheStatus && (
        <div className={`youtube-status ${cacheStatus.includes('success') ? 'success' : 'error'}`}>
          {cacheStatus}
        </div>
      )}

      {channelInfo && (
        <div className="youtube-channel-info">
          <div className="youtube-channel-header">
            {channelInfo.thumbnail && (
              <img
                src={channelInfo.thumbnail}
                alt={channelInfo.title}
                className="youtube-channel-thumbnail"
              />
            )}
            <div className="youtube-channel-details">
              <h4>{channelInfo.title}</h4>
              {channelInfo.customUrl && (
                <a
                  href={`https://www.youtube.com/${channelInfo.customUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="youtube-channel-link"
                >
                  {channelInfo.customUrl}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="youtube-stats">
          <div className="youtube-stat-item">
            <span className="youtube-stat-label">{t('youtube.admin.stats.subscribers')}</span>
            <strong className="youtube-stat-value">{formatNumber(stats.subscribers ?? 0)}</strong>
          </div>
          <div className="youtube-stat-item">
            <span className="youtube-stat-label">{t('youtube.admin.stats.videos')}</span>
            <strong className="youtube-stat-value">{formatNumber(stats.videos ?? 0)}</strong>
          </div>
          <div className="youtube-stat-item">
            <span className="youtube-stat-label">{t('youtube.admin.stats.views')}</span>
            <strong className="youtube-stat-value">{formatNumber(stats.views ?? 0)}</strong>
          </div>
        </div>
      )}

      <div className="youtube-videos-section">
        <h4>{t('youtube.admin.latestVideos')}</h4>
        {videos.length === 0 ? (
          <p className="youtube-empty">{t('youtube.admin.noVideos')}</p>
        ) : (
          <div className="youtube-videos-list">
            {videos.map((video) => (
              <div key={video.id} className="youtube-video-item">
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="youtube-video-link"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="youtube-video-thumbnail"
                  />
                  <div className="youtube-video-details">
                    <h5 className="youtube-video-title">{video.title}</h5>
                    <div className="youtube-video-meta">
                      <span>{formatNumber(video.viewCount ?? 0)} {t('youtube.admin.views')}</span>
                      <span>{formatDate(video.publishedAt)}</span>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {channelInfo?.id && (
        <div className="youtube-debug">
          <details>
            <summary>{t('youtube.admin.debugInfo')}</summary>
            <div className="youtube-debug-content">
              <p><strong>Channel ID:</strong> {channelInfo.id}</p>
              <p><strong>Channel URL:</strong>{' '}
                <a
                  href={`https://www.youtube.com/channel/${channelInfo.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  https://www.youtube.com/channel/{channelInfo.id}
                </a>
              </p>
            </div>
          </details>
        </div>
      )}
    </section>
  )
}
