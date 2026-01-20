import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import landingStyles from '../styles/Landing.module.css'
import './PodcastCarousel.css'

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
  feed_title?: string
  feed_cover?: string
}

interface PodcastFeed {
  id: string
  title: string
  cover_url?: string
  cover_r2_url?: string
}

export function PodcastCarousel() {
  const { t } = useTranslation()
  const [latestEpisodes, setLatestEpisodes] = useState<PodcastEpisode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchLatestEpisodes()
  }, [])

  const fetchLatestEpisodes = async () => {
    try {
      setLoading(true)
      setError(null)

      // First, get all podcast feeds
      const feedsResponse = await fetch(apiUrl(API_ENDPOINTS.feeds.list), {
        credentials: 'include',
      })

      if (!feedsResponse.ok) {
        throw new Error('Failed to fetch podcast feeds')
      }

      const feedsData = await feedsResponse.json()
      const podcastFeeds: PodcastFeed[] = Array.isArray(feedsData) 
        ? feedsData.filter((feed: any) => feed.feed_type === 'podcast')
        : []

      if (podcastFeeds.length === 0) {
        setLatestEpisodes([])
        setLoading(false)
        return
      }

      // Get the latest episode from each podcast
      const episodePromises = podcastFeeds.map(async (feed) => {
        try {
          const episodesResponse = await fetch(
            apiUrl(`${API_ENDPOINTS.feeds.episodes(feed.id)}?limit=1`),
            { credentials: 'include' }
          )

          if (episodesResponse.ok) {
            const episodes = await episodesResponse.json()
            if (Array.isArray(episodes) && episodes.length > 0) {
              const episode = episodes[0]
              return {
                ...episode,
                feed_title: feed.title,
                feed_cover: feed.cover_r2_url || feed.cover_url,
              }
            }
          }
          return null
        } catch (err) {
          console.error(`Error fetching episodes for feed ${feed.id}:`, err)
          return null
        }
      })

      const episodes = (await Promise.all(episodePromises))
        .filter((ep): ep is PodcastEpisode => ep !== null)
        .sort((a, b) => {
          const dateA = new Date(a.published_at).getTime()
          const dateB = new Date(b.published_at).getTime()
          return dateB - dateA // Most recent first
        })

      setLatestEpisodes(episodes)
    } catch (err) {
      console.error('Error fetching latest podcast episodes:', err)
      setError(err instanceof Error ? err.message : 'Failed to load podcasts')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return t('podcast.today', 'Today')
      if (diffDays === 1) return t('podcast.yesterday', 'Yesterday')
      if (diffDays < 7) return t('podcast.daysAgo', { count: diffDays }, `${diffDays} days ago`)
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return t('podcast.weeksAgo', { count: weeks }, `${weeks} weeks ago`)
      }
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return t('podcast.monthsAgo', { count: months }, `${months} months ago`)
      }
      const years = Math.floor(diffDays / 365)
      return t('podcast.yearsAgo', { count: years }, `${years} years ago`)
    } catch {
      return dateString
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return ''
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}min`
    }
    return `${minutes} min`
  }

  const nextEpisode = () => {
    setCurrentIndex((prev) => (prev + 1) % latestEpisodes.length)
  }

  const prevEpisode = () => {
    setCurrentIndex((prev) => (prev - 1 + latestEpisodes.length) % latestEpisodes.length)
  }

  const goToEpisode = (index: number) => {
    setCurrentIndex(index)
  }

  const handlePlay = (episode: PodcastEpisode) => {
    const audioUrl = episode.audio_r2_url || episode.audio_url
    if (audioUrl) {
      window.open(audioUrl, '_blank', 'noopener,noreferrer')
    }
  }

  if (loading) {
    return (
      <section className={landingStyles.magazineSection}>
        <h2 className={landingStyles.magazineSectionTitle}>
          {t('podcast.latestEpisodes', 'Latest Podcast Episodes')}
        </h2>
        <div className={landingStyles.magazineCard}>
          <div className={landingStyles.magazineCardContent}>
            <p>{t('podcast.loading', 'Loading podcasts...')}</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={landingStyles.magazineSection}>
        <h2 className={landingStyles.magazineSectionTitle}>
          {t('podcast.latestEpisodes', 'Latest Podcast Episodes')}
        </h2>
        <div className={landingStyles.magazineCard}>
          <div className={landingStyles.magazineCardContent}>
            <p>{t('podcast.error', 'Unable to load podcasts at this time.')}</p>
          </div>
        </div>
      </section>
    )
  }

  if (latestEpisodes.length === 0) {
    return (
      <section className={landingStyles.magazineSection}>
        <h2 className={landingStyles.magazineSectionTitle}>
          {t('podcast.latestEpisodes', 'Latest Podcast Episodes')}
        </h2>
        <div className={landingStyles.magazineCard}>
          <div className={landingStyles.magazineCardContent}>
            <p>{t('podcast.empty', 'No podcast episodes available.')}</p>
          </div>
        </div>
      </section>
    )
  }

  const currentEpisode = latestEpisodes[currentIndex]

  return (
    <section className={landingStyles.magazineSection}>
      <h2 className={landingStyles.magazineSectionTitle}>
        {t('podcast.latestEpisodes', 'Latest Podcast Episodes')}
      </h2>
      
      <div className="podcast-carousel-container">
        <div className={landingStyles.magazineCard}>
          <div className={landingStyles.magazineCardImage}>
            {currentEpisode.cover_r2_url || currentEpisode.cover_url || currentEpisode.feed_cover ? (
              <img
                src={currentEpisode.cover_r2_url || currentEpisode.cover_url || currentEpisode.feed_cover}
                alt={currentEpisode.title}
                className="podcast-cover-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const placeholder = target.nextElementSibling as HTMLElement
                  if (placeholder) placeholder.style.display = 'flex'
                }}
              />
            ) : null}
            <div 
              className={landingStyles.magazinePlaceholder}
              style={{ display: currentEpisode.cover_r2_url || currentEpisode.cover_url || currentEpisode.feed_cover ? 'none' : 'flex' }}
            >
              🎙️
            </div>
          </div>
          
          <div className={landingStyles.magazineCardContent}>
            {currentEpisode.feed_title && (
              <div className="podcast-feed-title">{currentEpisode.feed_title}</div>
            )}
            <h3 className={landingStyles.magazineCardTitle}>{currentEpisode.title}</h3>
            {currentEpisode.description && (
              <p className={landingStyles.magazineCardExcerpt}>
                {currentEpisode.description.length > 150
                  ? `${currentEpisode.description.substring(0, 150).replace(/<[^>]*>/g, '')}...`
                  : currentEpisode.description.replace(/<[^>]*>/g, '')}
              </p>
            )}
            <div className="podcast-episode-meta">
              <span className="podcast-episode-date">{formatDate(currentEpisode.published_at)}</span>
              {currentEpisode.duration && (
                <span className="podcast-episode-duration">
                  {formatDuration(currentEpisode.duration)}
                </span>
              )}
            </div>
            <button
              className="podcast-play-button"
              onClick={() => handlePlay(currentEpisode)}
              disabled={!currentEpisode.audio_r2_url && !currentEpisode.audio_url}
            >
              {t('podcast.play', 'Play Episode')} →
            </button>
          </div>
        </div>

        {latestEpisodes.length > 1 && (
          <div className="podcast-carousel-controls">
            <button
              className="podcast-carousel-button prev"
              onClick={prevEpisode}
              aria-label="Previous episode"
            >
              ←
            </button>
            <div className="podcast-carousel-indicators">
              {latestEpisodes.map((_, index) => (
                <button
                  key={index}
                  className={`podcast-carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToEpisode(index)}
                  aria-label={`Go to episode ${index + 1}`}
                />
              ))}
            </div>
            <button
              className="podcast-carousel-button next"
              onClick={nextEpisode}
              aria-label="Next episode"
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
