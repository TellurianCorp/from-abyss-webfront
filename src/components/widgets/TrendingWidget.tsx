import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { apiUrl, API_ENDPOINTS } from '../../utils/api'
import { WidgetCard } from './WidgetCard'
import styles from './TrendingWidget.module.css'

interface TrendingHashtag {
  tag: string
  count: number
  trend: 'up' | 'down' | 'stable'
}

export function TrendingWidget() {
  const { t } = useTranslation()
  const [hashtags, setHashtags] = useState<TrendingHashtag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(apiUrl(API_ENDPOINTS.microblog.trending), {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setHashtags(data.hashtags || [])
        }
      } catch (err) {
        console.error('Error fetching trending:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()

    // Refresh every 5 minutes
    const interval = setInterval(fetchTrending, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const icon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )

  return (
    <WidgetCard
      title={t('trending.title', 'Trending')}
      icon={icon}
    >
      {loading ? (
        <div className={styles.loading}>
          <div className="spinner"></div>
        </div>
      ) : hashtags.length === 0 ? (
        <div className={styles.empty}>
          <p>{t('trending.empty', 'No trending topics yet')}</p>
        </div>
      ) : (
        <div className={styles.hashtagList}>
          {hashtags.slice(0, 5).map((hashtag, index) => (
            <Link
              key={hashtag.tag}
              to={`/search?q=${encodeURIComponent('#' + hashtag.tag)}`}
              className={styles.hashtagItem}
            >
              <div className={styles.rank}>{index + 1}</div>
              <div className={styles.hashtagInfo}>
                <div className={styles.hashtagName}>#{hashtag.tag}</div>
                <div className={styles.hashtagCount}>
                  {hashtag.count} {t('trending.posts', { count: hashtag.count, defaultValue: 'posts' })}
                </div>
              </div>
              <div className={`${styles.trend} ${styles[hashtag.trend]}`}>
                {hashtag.trend === 'up' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                )}
                {hashtag.trend === 'down' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
                {hashtag.trend === 'stable' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
