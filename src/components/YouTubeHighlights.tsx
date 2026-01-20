import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import './YouTubeHighlights.css'

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

interface YouTubeResponse {
  data: VideoInfo[]
  count: number
}

export function YouTubeHighlights() {
  const { t } = useTranslation()
  const [videos, setVideos] = useState<VideoInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  
  const VIDEOS_PER_PAGE = 5

  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      setRetrying(false)
      
      const response = await fetch(apiUrl(`${API_ENDPOINTS.youtube.videos}?limit=30`))
      
      if (!response.ok) {
        // Check if response is JSON before trying to parse
        const contentType = response.headers.get('content-type')
        let errorMessage = `Failed to fetch videos: ${response.status}`
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            if (errorData.message) {
              errorMessage = errorData.message
            } else if (errorData.error) {
              errorMessage = errorData.error
            }
          } catch {
            // If JSON parsing fails, use default message
          }
        }
        throw new Error(errorMessage)
      }
      
      // Check Content-Type before parsing JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON but got ${contentType || 'unknown content type'}`)
      }
      
      const data: YouTubeResponse = await response.json()
      setVideos(data.data || [])
      setCurrentPage(1) // Reset to first page when videos are loaded
    } catch (err) {
      console.error('Error fetching YouTube videos:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load videos'
      setError(errorMessage)
      // Log more details for debugging
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleRetry = () => {
    setRetrying(true)
    fetchVideos()
  }

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return t('youtube.highlights.date.today')
    if (diffInDays === 1) return t('youtube.highlights.date.yesterday')
    if (diffInDays < 7) return t('youtube.highlights.date.daysAgo', { count: diffInDays })
    if (diffInDays < 30) return t('youtube.highlights.date.weeksAgo', { count: Math.floor(diffInDays / 7) })
    if (diffInDays < 365) return t('youtube.highlights.date.monthsAgo', { count: Math.floor(diffInDays / 30) })
    return t('youtube.highlights.date.yearsAgo', { count: Math.floor(diffInDays / 365) })
  }

  const formatDuration = (duration: string): string => {
    if (!duration) return ''
    
    // Parse ISO 8601 duration (PT15M30S format)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return duration
    
    const hours = parseInt(match[1] || '0', 10)
    const minutes = parseInt(match[2] || '0', 10)
    const seconds = parseInt(match[3] || '0', 10)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <section className="section youtube-section">
        <div className="youtube-videos youtube-loading-state">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card youtube-video-skeleton">
              <div className="skeleton-thumbnail"></div>
              <div className="card-body skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-title skeleton-title-short"></div>
                <div className="skeleton-meta"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="section youtube-section">
        <div className="youtube-error">
          <p>{error}</p>
          <button 
            className="youtube-retry-button"
            onClick={handleRetry}
            disabled={retrying}
            aria-label="Retry loading videos"
          >
            {retrying ? t('youtube.highlights.retrying') : t('youtube.highlights.retry')}
          </button>
        </div>
      </section>
    )
  }

  if (videos.length === 0) {
    return (
      <section className="section youtube-section">
        <div className="youtube-empty">
          <p>{t('youtube.highlights.empty')}</p>
        </div>
      </section>
    )
  }

  // Calculate pagination
  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE)
  const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE
  const endIndex = startIndex + VIDEOS_PER_PAGE
  const paginatedVideos = videos.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of videos section
    const videosSection = document.querySelector('.youtube-videos')
    if (videosSection) {
      videosSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="section youtube-section" itemScope itemType="https://schema.org/ItemList">
      <div className="youtube-videos" role="list">
        {paginatedVideos.map((video) => (
          <article
            key={video.id}
            className="card youtube-video-card"
            role="listitem"
            itemScope
            itemType="https://schema.org/VideoObject"
            itemProp="itemListElement"
          >
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noreferrer noopener"
              itemProp="url"
              className="youtube-video-link"
              aria-label={`${video.title} - ${formatViewCount(video.viewCount)} views`}
            >
              <div className="youtube-video-thumbnail">
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="card-img-top"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to placeholder if thumbnail fails to load
                    const target = e.target as HTMLImageElement
                    target.src = 'https://via.placeholder.com/320x180?text=Video+Thumbnail'
                  }}
                />
                {video.duration && (
                  <div className="youtube-video-duration">
                    {formatDuration(video.duration)}
                  </div>
                )}
              <div className="youtube-video-overlay">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="youtube-play-icon"
                  aria-hidden="true"
                >
                  <path
                    d="M8 5v14l11-7z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              </div>
              <div className="card-body">
                <h5 className="card-title youtube-video-title" itemProp="name">{video.title}</h5>
                {video.description && (
                  <p className="card-text youtube-video-description" itemProp="description">
                    {video.description.length > 150 
                      ? `${video.description.substring(0, 150)}...` 
                      : video.description}
                  </p>
                )}
                <div className="card-text youtube-video-meta">
                  <small className="text-muted">
                    <span className="youtube-video-views" itemProp="interactionStatistic" itemScope itemType="https://schema.org/InteractionCounter">
                      <meta itemProp="interactionType" content="https://schema.org/WatchAction" />
                      <meta itemProp="userInteractionCount" content={video.viewCount.toString()} />
                      {formatViewCount(video.viewCount)} {t('youtube.highlights.views')}
                    </span>
                    {video.likeCount > 0 && (
                      <span className="youtube-video-likes">
                        {formatViewCount(video.likeCount)}
                      </span>
                    )}
                    {video.duration && (
                      <span className="youtube-video-duration-text">
                        {formatDuration(video.duration)}
                      </span>
                    )}
                    <time className="youtube-video-date" itemProp="uploadDate" dateTime={video.publishedAt}>
                      {formatDate(video.publishedAt)}
                    </time>
                  </small>
                </div>
                <meta itemProp="thumbnailUrl" content={video.thumbnail} />
                <meta itemProp="duration" content={video.duration} />
              </div>
            </a>
          </article>
        ))}
      </div>
      
      {/* Pagination Controls - Only show if more than 5 videos */}
      {totalPages > 1 && (
        <div className="youtube-pagination">
        <button
          className="youtube-pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ← {t('youtube.highlights.pagination.prev', 'Prev')}
        </button>
        
        <div className="youtube-pagination-pages">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`youtube-pagination-page ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          className="youtube-pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          {t('youtube.highlights.pagination.next', 'Next')} →
        </button>
        </div>
      )}

      <a
        className="youtube-cta"
        href="https://www.youtube.com/@fromabyssmedia"
        target="_blank"
        rel="noreferrer noopener"
        itemProp="publisher"
        itemScope
        itemType="https://schema.org/YouTubeChannel"
      >
        <meta itemProp="name" content="From Abyss Media" />
        <meta itemProp="url" content="https://www.youtube.com/@fromabyssmedia" />
        {t('youtube.highlights.visitChannel')}
      </a>
    </section>
  )
}
