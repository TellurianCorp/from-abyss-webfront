import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './FeediverseHorrorFeed.css'

interface FeedItem {
  id: string
  title: string
  description: string
  link: string
  author?: string
  publishedAt: string
  source?: string
  tags?: string[]
  type?: 'feediverse' | 'microblog'
  // Microblog specific data
  microblogData?: {
    postId: string
    likeCount: number
    repostCount: number
    replyCount: number
    liked?: boolean
    federated: boolean
  }
}

interface MicroblogPost {
  id: string
  authorId: string
  authorName: string
  authorHandle: string
  authorAvatar?: string
  content: string
  mediaUrls?: string[]
  createdAt: string
  likeCount: number
  repostCount: number
  replyCount: number
  federated: boolean
}

interface FeediverseResponse {
  data: FeedItem[]
  count: number
}

interface TimelineResponse {
  posts: MicroblogPost[]
  next?: string
  prev?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080'

export function FeediverseHorrorFeed() {
  const { t } = useTranslation()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  // Mock horror feed data - used as fallback when API is unavailable
  const getMockData = (): FeedItem[] => [
    {
      id: '1',
      title: 'The Psychology of Cosmic Horror',
      description: 'Exploring how Lovecraftian themes tap into existential dread and the fear of the unknown.',
      link: '#',
      author: 'From Abyss Editorial',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Feediverse',
      tags: ['horror', 'psychology', 'cosmic']
    },
    {
      id: '2',
      title: 'Body Horror in Modern Cinema',
      description: 'A deep dive into how contemporary filmmakers use body transformation to explore identity and fear.',
      link: '#',
      author: 'Horror Analysis Collective',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Feediverse',
      tags: ['horror', 'cinema', 'body-horror']
    },
    {
      id: '3',
      title: 'Folk Horror Revival',
      description: 'The resurgence of rural terror and ancient rituals in independent horror games and films.',
      link: '#',
      author: 'Cult Cinema Network',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Feediverse',
      tags: ['horror', 'folk', 'indie']
    },
    {
      id: '4',
      title: 'Digital Dread: Horror in Virtual Spaces',
      description: 'How VR and immersive technologies are reshaping the horror experience and creating new forms of fear.',
      link: '#',
      author: 'Tech Horror Lab',
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Feediverse',
      tags: ['horror', 'vr', 'technology']
    },
    {
      id: '5',
      title: 'The Sound of Fear',
      description: 'Analyzing how sound design and audio manipulation create tension in horror media.',
      link: '#',
      author: 'Audio Horror Studies',
      publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Feediverse',
      tags: ['horror', 'sound-design', 'analysis']
    }
  ]

  useEffect(() => {
    const fetchAllFeeds = async () => {
      try {
        setLoading(true)
        const allItems: FeedItem[] = []
        
        // Fetch Feediverse horror feed
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)
          
          const feediverseResponse = await fetch(`${API_BASE_URL}/api/v1/feediverse/horror?limit=5`, {
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          if (feediverseResponse.ok) {
            const feediverseData: FeediverseResponse = await feediverseResponse.json()
            const feediverseItems = (feediverseData.data || []).map(item => ({ ...item, type: 'feediverse' as const }))
            allItems.push(...feediverseItems)
          } else {
            // Use mock data if API fails
            const mockItems = getMockData().map(item => ({ ...item, type: 'feediverse' as const }))
            allItems.push(...mockItems)
          }
        } catch (err) {
          // Use mock data on error
          const mockItems = getMockData().map(item => ({ ...item, type: 'feediverse' as const }))
          allItems.push(...mockItems)
        }
        
        // Fetch Microblog timeline
        try {
          const microblogResponse = await fetch(`${API_BASE_URL}/api/v1/microblog/timeline?limit=5`)
          
          if (microblogResponse.ok) {
            const microblogData: TimelineResponse = await microblogResponse.json()
            const microblogItems: FeedItem[] = (microblogData.posts || []).map(post => {
              // Extract first line or first 100 chars as title
              const firstLine = post.content.split('\n')[0]
              const title = firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine
              const description = post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content
              
              return {
                id: `microblog-${post.id}`,
                title: title || 'Community Post',
                description: description,
                link: `#post-${post.id}`,
                author: post.authorName || post.authorHandle,
                publishedAt: post.createdAt,
                source: post.federated ? 'Federated' : 'From Abyss',
                tags: ['community', 'horror', 'microblog'],
                type: 'microblog' as const,
                microblogData: {
                  postId: post.id,
                  likeCount: post.likeCount,
                  repostCount: post.repostCount,
                  replyCount: post.replyCount,
                  liked: post.liked,
                  federated: post.federated
                }
              }
            })
            allItems.push(...microblogItems)
          }
        } catch (err) {
          console.warn('Error fetching microblog timeline:', err)
        }
        
        // Sort by date (newest first) and limit total
        allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        setFeedItems(allItems.slice(0, 10))
      } catch (err) {
        console.error('Error fetching feeds:', err)
        setFeedItems(getMockData().map(item => ({ ...item, type: 'feediverse' as const })))
      } finally {
        setLoading(false)
      }
    }

    fetchAllFeeds()
  }, [])

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return t('feediverse.horror.date.today')
    if (diffInDays === 1) return t('feediverse.horror.date.yesterday')
    if (diffInDays < 7) return t('feediverse.horror.date.daysAgo', { count: diffInDays })
    if (diffInDays < 30) return t('feediverse.horror.date.weeksAgo', { count: Math.floor(diffInDays / 7) })
    if (diffInDays < 365) return t('feediverse.horror.date.monthsAgo', { count: Math.floor(diffInDays / 30) })
    return t('feediverse.horror.date.yearsAgo', { count: Math.floor(diffInDays / 365) })
  }

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/microblog/posts/${postId}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        const isLiked = likedPosts.has(postId)
        const newLikedPosts = new Set(likedPosts)
        
        if (isLiked) {
          newLikedPosts.delete(postId)
        } else {
          newLikedPosts.add(postId)
        }
        
        setLikedPosts(newLikedPosts)
        
        // Update local state
        setFeedItems(feedItems.map(item => {
          if (item.microblogData?.postId === postId) {
            const wasLiked = item.microblogData.liked || likedPosts.has(postId)
            return {
              ...item,
              microblogData: {
                ...item.microblogData,
                liked: !wasLiked,
                likeCount: wasLiked ? item.microblogData.likeCount - 1 : item.microblogData.likeCount + 1
              }
            }
          }
          return item
        }))
      }
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  if (loading) {
    return (
      <section className="section feediverse-section">
        <div className="section-header">
          <h2>{t('feediverse.horror.title')}</h2>
          <p>{t('feediverse.horror.description')}</p>
        </div>
        <div className="feediverse-loading">
          <p>{t('feediverse.horror.loading')}</p>
        </div>
      </section>
    )
  }

  if (feedItems.length === 0) {
    return (
      <section className="section feediverse-section">
        <div className="section-header">
          <h2>{t('feediverse.horror.title')}</h2>
          <p>{t('feediverse.horror.description')}</p>
        </div>
        <div className="feediverse-empty">
          <p>{t('feediverse.horror.empty')}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section feediverse-section">
      <div className="section-header">
        <h2>{t('feediverse.horror.title', 'Horror Community Feed')}</h2>
        <p>{t('feediverse.horror.description', 'Latest from the horror community across Fediverse and From Abyss Media.')}</p>
      </div>
      <div className="feediverse-items">
        {feedItems.map((item) => {
          const hasActions = item.type === 'microblog' && item.microblogData
          
          return (
            <div key={item.id} className={hasActions ? 'feediverse-item-wrapper' : ''}>
              <a
                href={item.link}
                target={item.link.startsWith('#') ? undefined : '_blank'}
                rel={item.link.startsWith('#') ? undefined : 'noreferrer'}
                className={hasActions ? 'feediverse-item' : 'feediverse-item feediverse-item-standalone'}
              >
                <div className="feediverse-item-content">
                  <h3 className="feediverse-item-title">{item.title}</h3>
                  <p className="feediverse-item-description">{item.description}</p>
                  <div className="feediverse-item-meta">
                    {item.author && (
                      <span className="feediverse-item-author">{item.author}</span>
                    )}
                    <span className="feediverse-item-date">{formatDate(item.publishedAt)}</span>
                    {item.source && (
                      <span className="feediverse-item-source">{item.source}</span>
                    )}
                    {item.type === 'microblog' && (
                      <span className="feediverse-item-source" style={{ marginLeft: '0.5rem' }}>Community</span>
                    )}
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div className="feediverse-item-tags">
                      {item.tags.map((tag, index) => (
                        <span key={index} className="feediverse-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </a>
              {hasActions && (
                <div className="feediverse-item-actions">
                  <button
                    className={`feediverse-action ${(item.microblogData!.liked || likedPosts.has(item.microblogData!.postId)) ? 'liked' : ''}`}
                    onClick={(e) => handleLike(item.microblogData!.postId, e)}
                    aria-label={t('microblog.like', 'Like')}
                    title={t('microblog.like', 'Like')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>{item.microblogData!.likeCount}</span>
                  </button>
                  <button
                    className="feediverse-action"
                    aria-label={t('microblog.reply', 'Reply')}
                    title={t('microblog.reply', 'Reply')}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>{item.microblogData!.replyCount}</span>
                  </button>
                  <button
                    className="feediverse-action"
                    aria-label={t('microblog.repost', 'Repost')}
                    title={t('microblog.repost', 'Repost')}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="17 1 21 5 17 9" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <polyline points="7 23 3 19 7 15" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                    <span>{item.microblogData!.repostCount}</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <a
        className="feediverse-cta"
        href="https://feediverse.example.com/horror"
        target="_blank"
        rel="noreferrer"
      >
        {t('feediverse.horror.exploreMore')}
      </a>
    </section>
  )
}
