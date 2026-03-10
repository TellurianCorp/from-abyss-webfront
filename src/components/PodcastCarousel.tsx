import { useState, useEffect, useRef, useCallback } from 'react'
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

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2]

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PodcastCarousel() {
  const { t } = useTranslation()
  const [latestEpisodes, setLatestEpisodes] = useState<PodcastEpisode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Player state
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [bufferedRatio, setBufferedRatio] = useState(0)
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioError, setAudioError] = useState(false)

  useEffect(() => {
    fetchLatestEpisodes()
  }, [])

  // Reset player when episode changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setIsPlaying(false)
    setCurrentTime(0)
    setAudioDuration(0)
    setBufferedRatio(0)
    setAudioLoading(false)
    setAudioError(false)
  }, [currentIndex])

  // Sync volume/mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const fetchLatestEpisodes = async () => {
    try {
      setLoading(true)
      setError(null)

      const feedsResponse = await fetch(apiUrl(API_ENDPOINTS.feeds.publicList))

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

      const episodePromises = podcastFeeds.map(async (feed) => {
        try {
          const url = apiUrl(`${API_ENDPOINTS.feeds.publicEpisodes(feed.id)}?limit=1`)
          const episodesResponse = await fetch(url)
          if (!episodesResponse.ok) {
            console.warn(`Episodes endpoint returned ${episodesResponse.status} for feed ${feed.id} (${url})`)
            return null
          }
          const episodes = await episodesResponse.json()
          if (Array.isArray(episodes) && episodes.length > 0) {
            return {
              ...episodes[0],
              feed_title: feed.title,
              feed_cover: feed.cover_r2_url || feed.cover_url,
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
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

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
      const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 0) return t('podcast.today', 'Today')
      if (diffDays === 1) return t('podcast.yesterday', 'Yesterday')
      if (diffDays < 7) return t('podcast.daysAgo', { count: diffDays, defaultValue: `${diffDays} days ago` })
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return t('podcast.weeksAgo', { count: weeks, defaultValue: `${weeks} weeks ago` })
      }
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return t('podcast.monthsAgo', { count: months, defaultValue: `${months} months ago` })
      }
      const years = Math.floor(diffDays / 365)
      return t('podcast.yearsAgo', { count: years, defaultValue: `${years} years ago` })
    } catch {
      return dateString
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return ''
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes.toString().padStart(2, '0')}min` : `${minutes} min`
  }

  const handlePlayPause = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !audio.src) return
    if (isPlaying) {
      audio.pause()
    } else {
      try {
        await audio.play()
      } catch (err) {
        if ((err as DOMException).name !== 'AbortError') {
          console.error('Playback failed:', err)
        }
      }
    }
  }, [isPlaying])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const bar = progressRef.current
    if (!audio || !bar || !audioDuration) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = ratio * audioDuration
  }, [audioDuration])

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (v > 0) setIsMuted(false)
  }

  const nextEpisode = () => setCurrentIndex((prev) => (prev + 1) % latestEpisodes.length)
  const prevEpisode = () => setCurrentIndex((prev) => (prev - 1 + latestEpisodes.length) % latestEpisodes.length)

  const volumeIcon = isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'
  const progressPct = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0

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
  const audioUrl = currentEpisode.audio_r2_url || currentEpisode.audio_url
  // Ordered list of cover URLs to try, falling back on error
  const coverCandidates = [
    currentEpisode.cover_r2_url,
    currentEpisode.cover_url,
    currentEpisode.feed_cover,
  ].filter(Boolean) as string[]
  const coverSrc = coverCandidates[0] ?? null

  return (
    <section className={landingStyles.magazineSection}>
      <h2 className={landingStyles.magazineSectionTitle}>
        {t('podcast.latestEpisodes', 'Latest Podcast Episodes')}
      </h2>

      <div className="podcast-carousel-container">
        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={audioUrl || undefined}
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => { setIsPlaying(false); setCurrentTime(0) }}
          onTimeUpdate={() => {
            const audio = audioRef.current
            if (!audio) return
            setCurrentTime(audio.currentTime)
            if (audio.buffered.length > 0) {
              setBufferedRatio(audio.buffered.end(audio.buffered.length - 1) / audio.duration)
            }
          }}
          onLoadedMetadata={() => {
            const audio = audioRef.current
            if (audio) {
              setAudioDuration(audio.duration)
              audio.playbackRate = playbackRate
              audio.volume = isMuted ? 0 : volume
            }
          }}
          onWaiting={() => setAudioLoading(true)}
          onCanPlay={() => { setAudioLoading(false); setAudioError(false) }}
          onError={() => { setAudioLoading(false); setAudioError(true) }}
        />

        <div className={landingStyles.magazineCard}>
          <div className="podcast-card-image">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={currentEpisode.title}
                className="podcast-cover-image"
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  const currentSrc = img.src
                  const nextIdx = coverCandidates.indexOf(currentSrc) + 1
                  if (nextIdx < coverCandidates.length) {
                    img.src = coverCandidates[nextIdx]
                  } else {
                    img.style.display = 'none'
                    const ph = img.nextElementSibling as HTMLElement
                    if (ph) ph.style.display = 'flex'
                  }
                }}
              />
            ) : null}
            <div
              className={landingStyles.magazinePlaceholder}
              style={{ display: coverSrc ? 'none' : 'flex' }}
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
                {currentEpisode.description.replace(/<[^>]*>/g, '').substring(0, 150)}
                {currentEpisode.description.length > 150 ? '…' : ''}
              </p>
            )}
            <div className="podcast-episode-meta">
              <span className="podcast-episode-date">{formatDate(currentEpisode.published_at)}</span>
              {currentEpisode.duration && (
                <span className="podcast-episode-duration">{formatDuration(currentEpisode.duration)}</span>
              )}
            </div>

            {/* Player */}
            <div className="podcast-player">
              {/* Progress bar */}
              <div
                className="podcast-progress-bar"
                ref={progressRef}
                onClick={handleSeek}
                role="slider"
                aria-label="Seek"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progressPct)}
              >
                <div className="podcast-progress-buffered" style={{ width: `${bufferedRatio * 100}%` }} />
                <div className="podcast-progress-played" style={{ width: `${progressPct}%` }}>
                  <div className="podcast-progress-thumb" />
                </div>
              </div>

              {/* Time display */}
              <div className="podcast-time-display">
                <span>{formatTime(currentTime)}</span>
                <span>{audioDuration > 0 ? formatTime(audioDuration) : formatTime(currentEpisode.duration ?? 0)}</span>
              </div>

              {/* Controls */}
              <div className="podcast-controls">
                {/* Volume */}
                <div className="podcast-volume-group">
                  <button
                    className="podcast-icon-button"
                    onClick={() => setIsMuted(m => !m)}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {volumeIcon}
                  </button>
                  <input
                    type="range"
                    className="podcast-volume-slider"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Volume"
                  />
                </div>

                {/* Transport */}
                <div className="podcast-transport">
                  {latestEpisodes.length > 1 && (
                    <button
                      className="podcast-icon-button"
                      onClick={prevEpisode}
                      aria-label="Previous episode"
                      title="Previous episode"
                    >
                      ⏮
                    </button>
                  )}
                  {audioError ? (
                    <a
                      className="podcast-play-pause-button podcast-external-link"
                      href={audioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open audio externally"
                      aria-label="Open audio externally"
                    >
                      ↗
                    </a>
                  ) : (
                    <button
                      className={`podcast-play-pause-button ${audioLoading ? 'loading' : ''}`}
                      onClick={handlePlayPause}
                      disabled={!audioUrl}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {audioLoading ? (
                        <span className="podcast-spinner" />
                      ) : isPlaying ? (
                        '⏸'
                      ) : (
                        '▶'
                      )}
                    </button>
                  )}
                  {latestEpisodes.length > 1 && (
                    <button
                      className="podcast-icon-button"
                      onClick={nextEpisode}
                      aria-label="Next episode"
                      title="Next episode"
                    >
                      ⏭
                    </button>
                  )}
                </div>

                {/* Speed */}
                <div className="podcast-speed-group">
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      className={`podcast-speed-button ${playbackRate === rate ? 'active' : ''}`}
                      onClick={() => setPlaybackRate(rate)}
                      aria-label={`${rate}× speed`}
                      title={`${rate}× speed`}
                    >
                      {rate === 1 ? '1×' : `${rate}×`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel indicators */}
        {latestEpisodes.length > 1 && (
          <div className="podcast-carousel-indicators">
            {latestEpisodes.map((_, index) => (
              <button
                key={index}
                className={`podcast-carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Episode ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
