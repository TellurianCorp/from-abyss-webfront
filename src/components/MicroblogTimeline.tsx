import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import FollowButton from './FollowButton'
import Notifications from './Notifications'
import './MicroblogTimeline.css'

interface Post {
  id: string
  authorId: string
  authorName: string
  authorHandle: string
  authorAvatar?: string
  content: string
  mediaUrls?: string[]
  threadId?: string
  replyToId?: string
  createdAt: string
  likeCount: number
  repostCount: number
  replyCount: number
  liked?: boolean
  reposted?: boolean
  federated: boolean
  source?: string
}

interface TimelineResponse {
  posts: Post[]
  next?: string
  prev?: string
}

interface MicroblogTimelineProps {
  userId?: string
}

export function MicroblogTimeline({ userId }: MicroblogTimelineProps) {
  const { t } = useTranslation()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTimeline()
  }, [])

  const fetchTimeline = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(apiUrl(`${API_ENDPOINTS.microblog.timeline}?limit=20`))
      
      if (!response.ok) {
        throw new Error(`Failed to fetch timeline: ${response.status}`)
      }

      const data: TimelineResponse = await response.json()
      setPosts(data.posts || [])
    } catch (err) {
      console.error('Error fetching timeline:', err)
      setError(err instanceof Error ? err.message : 'Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return t('microblog.time.justNow')
    if (diffInSeconds < 3600) return t('microblog.time.minutesAgo', { count: Math.floor(diffInSeconds / 60) })
    if (diffInSeconds < 86400) return t('microblog.time.hoursAgo', { count: Math.floor(diffInSeconds / 3600) })
    if (diffInSeconds < 604800) return t('microblog.time.daysAgo', { count: Math.floor(diffInSeconds / 86400) })
    
    return date.toLocaleDateString()
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.microblog.likePost(postId)), {
        method: 'POST',
      })

      if (response.ok) {
        // Update local state
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, liked: !post.liked, likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1 }
            : post
        ))
      }
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  if (loading) {
    return (
      <div className="microblog-timeline">
        <div className="microblog-loading">
          <p>{t('microblog.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="microblog-timeline">
        <div className="microblog-error">
          <p>{t('microblog.error')}</p>
          <button onClick={fetchTimeline}>{t('microblog.retry')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="microblog-timeline">
      <div className="microblog-header">
        <div className="header-content">
          <div>
            <h2>{t('microblog.title')}</h2>
            <p>{t('microblog.description')}</p>
          </div>
          {userId && <Notifications userId={userId} />}
        </div>
      </div>
      <div className="microblog-posts">
        {posts.map((post) => (
          <article key={post.id} className="microblog-post">
            <div className="microblog-post-header">
              {post.authorAvatar && (
                <img src={post.authorAvatar} alt={post.authorName} className="microblog-avatar" />
              )}
              <div className="microblog-author">
                <strong>{post.authorName}</strong>
                <span className="microblog-handle">{post.authorHandle}</span>
                <span className="microblog-time">{formatDate(post.createdAt)}</span>
              </div>
              <div className="post-actions-header">
                {post.federated && (
                  <span className="federated-badge">{t('microblog.federated')}</span>
                )}
                {userId && post.authorId !== userId && (
                  <FollowButton
                    actorId={post.authorId}
                    userId={userId}
                  />
                )}
              </div>
            </div>
            <div className="microblog-content">
              <p>{post.content}</p>
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="microblog-media">
                  {post.mediaUrls.map((url, index) => (
                    <img key={index} src={url} alt={`Media ${index + 1}`} />
                  ))}
                </div>
              )}
            </div>
            <div className="microblog-actions">
              <button
                className={`microblog-action ${post.liked ? 'liked' : ''}`}
                onClick={() => handleLike(post.id)}
                aria-label={t('microblog.like')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>{post.likeCount}</span>
              </button>
              <button className="microblog-action" aria-label={t('microblog.reply')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>{post.replyCount}</span>
              </button>
              <button className="microblog-action" aria-label={t('microblog.repost')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
                <span>{post.repostCount}</span>
              </button>
            </div>
            {post.federated && (
              <div className="microblog-federated">
                <span>{t('microblog.federated')}</span>
              </div>
            )}
          </article>
        ))}
      </div>
      {posts.length === 0 && (
        <div className="microblog-empty">
          <p>{t('microblog.empty')}</p>
        </div>
      )}
    </div>
  )
}
