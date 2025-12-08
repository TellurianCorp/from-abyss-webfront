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

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(apiUrl(`${API_ENDPOINTS.youtube.videos}?limit=5`))
        
        if (!response.ok) {
          // Try to get error message from response
          let errorMessage = `Failed to fetch videos: ${response.status}`
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
          throw new Error(errorMessage)
        }
        
        const data: YouTubeResponse = await response.json()
        setVideos(data.data || [])
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

    fetchVideos()
  }, [])

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

  if (loading) {
    return (
      <section className="section youtube-section">
        <div className="section-header">
          <h2>{t('youtube.highlights.title')}</h2>
          <p>{t('youtube.highlights.description')}</p>
        </div>
        <div className="youtube-loading">
          <p>{t('youtube.highlights.loading')}</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="section youtube-section">
        <div className="section-header">
          <h2>{t('youtube.highlights.title')}</h2>
          <p>{t('youtube.highlights.description')}</p>
        </div>
        <div className="youtube-error">
          <p>{t('youtube.highlights.error')}</p>
        </div>
      </section>
    )
  }

  if (videos.length === 0) {
    return (
      <section className="section youtube-section">
        <div className="section-header">
          <h2>{t('youtube.highlights.title')}</h2>
          <p>{t('youtube.highlights.description')}</p>
        </div>
        <div className="youtube-empty">
          <p>{t('youtube.highlights.empty')}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section youtube-section">
      <div className="section-header">
        <h2>{t('youtube.highlights.title')}</h2>
        <p>{t('youtube.highlights.description')}</p>
      </div>
      <div className="youtube-videos">
        {videos.map((video) => (
          <a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noreferrer"
            className="youtube-video-item"
          >
            <div className="youtube-video-thumbnail">
              <img src={video.thumbnail} alt={video.title} loading="lazy" />
              <div className="youtube-video-overlay">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 5v14l11-7z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
            <div className="youtube-video-info">
              <h3 className="youtube-video-title">{video.title}</h3>
              <div className="youtube-video-meta">
                <span className="youtube-video-views">{formatViewCount(video.viewCount)} {t('youtube.highlights.views')}</span>
                <span className="youtube-video-date">{formatDate(video.publishedAt)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
      <a
        className="youtube-cta"
        href="https://www.youtube.com/@fromabyssmedia"
        target="_blank"
        rel="noreferrer"
      >
        {t('youtube.highlights.visitChannel')}
      </a>
    </section>
  )
}
