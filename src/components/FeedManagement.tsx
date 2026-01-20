import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import { useToast } from '../hooks/useToast'
import './FeedManagement.css'

interface Feed {
  id: string
  url: string
  title: string
  feed_type: string
  description?: string
  tags?: string[]
  health_status: string
  last_health_check?: string
  last_fetch_at?: string
  cover_url?: string
  cover_r2_url?: string
  created_at: string
  updated_at: string
}

interface FeedHealthCheck {
  id: string
  feed_id: string
  status: string
  status_code?: number
  error?: string
  response_time_ms: number
  checked_at: string
}

interface PodcastEpisode {
  id: string
  feed_id: string
  title: string
  description?: string
  guid: string
  audio_url: string
  audio_r2_url?: string
  cover_url?: string
  cover_r2_url?: string
  published_at: string
  duration?: number
  created_at: string
}

interface CreateFeedRequest {
  url: string
  title?: string
  feed_type: string
  description?: string
  tags?: string[]
}

export function FeedManagement() {
  const { t } = useTranslation()
  const { success, error: showError } = useToast()
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null)
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([])
  const [healthHistory, setHealthHistory] = useState<FeedHealthCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [checkingHealth, setCheckingHealth] = useState<string | null>(null)
  
  const [newFeed, setNewFeed] = useState<CreateFeedRequest>({
    url: '',
    feed_type: 'article',
    title: '',
    description: '',
    tags: [],
  })

  useEffect(() => {
    fetchFeeds()
  }, [])

  const fetchFeeds = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(apiUrl(API_ENDPOINTS.feeds.list), {
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setFeeds(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching feeds:', err)
      setError(err instanceof Error ? err.message : 'Failed to load feeds')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFeed = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setCreating(true)
      setError(null)

      const response = await fetch(apiUrl(API_ENDPOINTS.feeds.create), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newFeed),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
      }

      const createdFeed = await response.json()
      setFeeds([...feeds, createdFeed])
      setShowCreateForm(false)
      setNewFeed({
        url: '',
        feed_type: 'article',
        title: '',
        description: '',
        tags: [],
      })
      success('Feed created successfully')
    } catch (err) {
      console.error('Error creating feed:', err)
      showError(err instanceof Error ? err.message : 'Failed to create feed')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteFeed = async (feedId: string) => {
    if (!confirm('Are you sure you want to delete this feed?')) {
      return
    }

    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.feeds.delete(feedId)), {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
      }

      setFeeds(feeds.filter(f => f.id !== feedId))
      if (selectedFeed?.id === feedId) {
        setSelectedFeed(null)
        setEpisodes([])
        setHealthHistory([])
      }
      success('Feed deleted successfully')
    } catch (err) {
      console.error('Error deleting feed:', err)
      showError(err instanceof Error ? err.message : 'Failed to delete feed')
    }
  }

  const handleCheckHealth = async (feedId: string) => {
    try {
      setCheckingHealth(feedId)
      setError(null)

      const response = await fetch(apiUrl(API_ENDPOINTS.feeds.healthCheck(feedId)), {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
      }

      const check = await response.json()
      await fetchFeeds() // Refresh feeds to update health status
      if (selectedFeed?.id === feedId) {
        setHealthHistory([check, ...healthHistory])
      }
      success(`Health check completed: ${check.status}`)
    } catch (err) {
      console.error('Error checking health:', err)
      showError(err instanceof Error ? err.message : 'Failed to check feed health')
    } finally {
      setCheckingHealth(null)
    }
  }

  const handleSyncPodcast = async (feedId: string) => {
    try {
      setSyncing(feedId)
      setError(null)

      const response = await fetch(apiUrl(API_ENDPOINTS.feeds.sync(feedId)), {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
      }

      success('Podcast sync started')
      // Refresh episodes after a delay
      setTimeout(() => {
        if (selectedFeed?.id === feedId) {
          fetchEpisodes(feedId)
        }
      }, 2000)
    } catch (err) {
      console.error('Error syncing podcast:', err)
      showError(err instanceof Error ? err.message : 'Failed to sync podcast')
    } finally {
      setSyncing(null)
    }
  }

  const fetchEpisodes = async (feedId: string) => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.feeds.episodes(feedId)), {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setEpisodes(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Error fetching episodes:', err)
    }
  }

  const fetchHealthHistory = async (feedId: string) => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.feeds.healthHistory(feedId)), {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setHealthHistory(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Error fetching health history:', err)
    }
  }

  const handleSelectFeed = (feed: Feed) => {
    setSelectedFeed(feed)
    setEpisodes([])
    setHealthHistory([])
    
    if (feed.feed_type === 'podcast') {
      fetchEpisodes(feed.id)
    }
    fetchHealthHistory(feed.id)
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'status-healthy'
      case 'unhealthy':
        return 'status-unhealthy'
      default:
        return 'status-unknown'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <section className="admin-panel feed-management">
        <h3>Feed Administration</h3>
        <div className="feed-loading">
          <p>Loading feeds...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-panel feed-management">
      <div className="feed-header">
        <h3>Feed Administration</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="feed-btn feed-btn-primary"
        >
          {showCreateForm ? 'Cancel' : '+ Add Feed'}
        </button>
      </div>

      {error && (
        <div className="feed-error">
          <p>{error}</p>
          <button onClick={fetchFeeds} className="feed-btn feed-btn-secondary">
            Retry
          </button>
        </div>
      )}

      {showCreateForm && (
        <div className="feed-create-form">
          <h4>Create New Feed</h4>
          <form onSubmit={handleCreateFeed}>
            <div className="feed-form-group">
              <label>
                Feed URL <span className="required">*</span>
                <input
                  type="url"
                  value={newFeed.url}
                  onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
                  required
                  placeholder="https://example.com/feed.xml"
                />
              </label>
            </div>
            <div className="feed-form-group">
              <label>
                Feed Type <span className="required">*</span>
                <select
                  value={newFeed.feed_type}
                  onChange={(e) => setNewFeed({ ...newFeed, feed_type: e.target.value })}
                  required
                >
                  <option value="article">Article</option>
                  <option value="podcast">Podcast</option>
                  <option value="news">News</option>
                  <option value="blog">Blog</option>
                </select>
              </label>
            </div>
            <div className="feed-form-group">
              <label>
                Title (optional - will be fetched from feed if not provided)
                <input
                  type="text"
                  value={newFeed.title}
                  onChange={(e) => setNewFeed({ ...newFeed, title: e.target.value })}
                  placeholder="Feed title"
                />
              </label>
            </div>
            <div className="feed-form-group">
              <label>
                Description
                <textarea
                  value={newFeed.description}
                  onChange={(e) => setNewFeed({ ...newFeed, description: e.target.value })}
                  placeholder="Feed description"
                  rows={3}
                />
              </label>
            </div>
            <div className="feed-form-actions">
              <button
                type="submit"
                disabled={creating}
                className="feed-btn feed-btn-primary"
              >
                {creating ? 'Creating...' : 'Create Feed'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="feed-content">
        <div className="feed-list">
          <h4>Feeds ({feeds.length})</h4>
          {feeds.length === 0 ? (
            <p className="feed-empty">No feeds configured. Create one to get started.</p>
          ) : (
            <div className="feed-items">
              {feeds.map((feed) => (
                <div
                  key={feed.id}
                  className={`feed-item ${selectedFeed?.id === feed.id ? 'selected' : ''}`}
                  onClick={() => handleSelectFeed(feed)}
                >
                  <div className="feed-item-header">
                    <h5>{feed.title || feed.url}</h5>
                    <span className={`feed-status ${getHealthStatusColor(feed.health_status)}`}>
                      {feed.health_status}
                    </span>
                  </div>
                  <div className="feed-item-meta">
                    <span className="feed-type">{feed.feed_type}</span>
                    <span className="feed-url">{feed.url}</span>
                  </div>
                  <div className="feed-item-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCheckHealth(feed.id)
                      }}
                      disabled={checkingHealth === feed.id}
                      className="feed-btn feed-btn-small"
                    >
                      {checkingHealth === feed.id ? 'Checking...' : 'Check Health'}
                    </button>
                    {feed.feed_type === 'podcast' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSyncPodcast(feed.id)
                        }}
                        disabled={syncing === feed.id}
                        className="feed-btn feed-btn-small"
                      >
                        {syncing === feed.id ? 'Syncing...' : 'Sync'}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteFeed(feed.id)
                      }}
                      className="feed-btn feed-btn-small feed-btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedFeed && (
          <div className="feed-details">
            <div className="feed-details-header">
              <h4>{selectedFeed.title || selectedFeed.url}</h4>
              <button
                onClick={() => setSelectedFeed(null)}
                className="feed-btn feed-btn-small"
              >
                Close
              </button>
            </div>

            <div className="feed-details-content">
              {selectedFeed.feed_type === 'podcast' && (selectedFeed.cover_r2_url || selectedFeed.cover_url) && (
                <div className="feed-podcast-cover-section">
                  <h5>Podcast Cover</h5>
                  <div className="feed-podcast-cover-container">
                    <img
                      src={selectedFeed.cover_r2_url || selectedFeed.cover_url}
                      alt={selectedFeed.title}
                      className="feed-podcast-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        if (selectedFeed.cover_r2_url && selectedFeed.cover_url) {
                          target.src = selectedFeed.cover_url
                        } else {
                          target.style.display = 'none'
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="feed-detail-section">
                <h5>Information</h5>
                <dl>
                  <dt>URL:</dt>
                  <dd><a href={selectedFeed.url} target="_blank" rel="noreferrer">{selectedFeed.url}</a></dd>
                  <dt>Type:</dt>
                  <dd>{selectedFeed.feed_type}</dd>
                  <dt>Health Status:</dt>
                  <dd>
                    <span className={`feed-status ${getHealthStatusColor(selectedFeed.health_status)}`}>
                      {selectedFeed.health_status}
                    </span>
                  </dd>
                  <dt>Last Health Check:</dt>
                  <dd>{formatDate(selectedFeed.last_health_check)}</dd>
                  <dt>Last Fetch:</dt>
                  <dd>{formatDate(selectedFeed.last_fetch_at)}</dd>
                  {selectedFeed.description && (
                    <>
                      <dt>Description:</dt>
                      <dd>{selectedFeed.description}</dd>
                    </>
                  )}
                  {selectedFeed.tags && selectedFeed.tags.length > 0 && (
                    <>
                      <dt>Tags:</dt>
                      <dd>
                        {selectedFeed.tags.map((tag, i) => (
                          <span key={i} className="feed-tag">{tag}</span>
                        ))}
                      </dd>
                    </>
                  )}
                </dl>
              </div>

              {selectedFeed.feed_type === 'podcast' && (
                <div className="feed-detail-section">
                  <div className="feed-episodes-header">
                    <h5>Episodes ({episodes.length})</h5>
                    <button
                      onClick={() => handleSyncPodcast(selectedFeed.id)}
                      disabled={syncing === selectedFeed.id}
                      className="feed-btn feed-btn-small feed-btn-primary"
                    >
                      {syncing === selectedFeed.id ? 'Syncing...' : 'Sync Episodes'}
                    </button>
                  </div>
                  {episodes.length === 0 ? (
                    <div className="feed-empty-state">
                      <p className="feed-empty">No episodes found.</p>
                      <button
                        onClick={() => handleSyncPodcast(selectedFeed.id)}
                        disabled={syncing === selectedFeed.id}
                        className="feed-btn feed-btn-primary"
                      >
                        {syncing === selectedFeed.id ? 'Syncing...' : 'Sync Episodes Now'}
                      </button>
                    </div>
                  ) : (
                    <div className="feed-episodes-grid">
                      {episodes.map((episode) => (
                        <div key={episode.id} className="feed-episode-card">
                          <div className="feed-episode-cover">
                            {episode.cover_r2_url ? (
                              <img
                                src={episode.cover_r2_url}
                                alt={episode.title}
                                className="feed-episode-cover-image"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  if (episode.cover_url) {
                                    target.src = episode.cover_url
                                  } else {
                                    target.style.display = 'none'
                                  }
                                }}
                              />
                            ) : episode.cover_url ? (
                              <img
                                src={episode.cover_url}
                                alt={episode.title}
                                className="feed-episode-cover-image"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="feed-episode-cover-placeholder">
                                <span className="feed-episode-cover-icon">🎙️</span>
                              </div>
                            )}
                            {episode.audio_r2_url && (
                              <div className="feed-episode-play-overlay">
                                <a
                                  href={episode.audio_r2_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="feed-episode-play-button"
                                  title="Play Episode"
                                >
                                  ▶
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="feed-episode-content">
                            <div className="feed-episode-header">
                              <h6 className="feed-episode-title">{episode.title}</h6>
                              <span className="feed-episode-date">
                                {formatDate(episode.published_at)}
                              </span>
                            </div>
                            {episode.description && (
                              <div 
                                className="feed-episode-description"
                                dangerouslySetInnerHTML={{ 
                                  __html: episode.description.length > 200 
                                    ? episode.description.substring(0, 200) + '...' 
                                    : episode.description 
                                }}
                              />
                            )}
                            <div className="feed-episode-meta">
                              {episode.duration && (
                                <span className="feed-episode-duration">
                                  <span className="feed-episode-meta-icon">⏱️</span>
                                  {formatDuration(episode.duration)}
                                </span>
                              )}
                              {episode.audio_r2_url && (
                                <a
                                  href={episode.audio_r2_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="feed-episode-listen-link"
                                >
                                  <span className="feed-episode-meta-icon">🎧</span>
                                  Listen
                                </a>
                              )}
                              {episode.audio_url && !episode.audio_r2_url && (
                                <a
                                  href={episode.audio_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="feed-episode-listen-link"
                                >
                                  <span className="feed-episode-meta-icon">🔗</span>
                                  Original URL
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="feed-detail-section">
                <h5>Health History</h5>
                {healthHistory.length === 0 ? (
                  <p className="feed-empty">No health check history available.</p>
                ) : (
                  <div className="feed-health-history">
                    {healthHistory.map((check) => (
                      <div key={check.id} className="feed-health-check">
                        <div className="feed-health-check-header">
                          <span className={`feed-status ${check.status === 'success' ? 'status-healthy' : 'status-unhealthy'}`}>
                            {check.status}
                          </span>
                          <span className="feed-health-check-time">
                            {formatDate(check.checked_at)}
                          </span>
                        </div>
                        <div className="feed-health-check-details">
                          {check.status_code && (
                            <span>Status: {check.status_code}</span>
                          )}
                          <span>Response Time: {check.response_time_ms}ms</span>
                          {check.error && (
                            <span className="feed-error-text">Error: {check.error}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
