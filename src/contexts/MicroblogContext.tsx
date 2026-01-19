import { createContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { apiUrl, API_ENDPOINTS } from '../utils/api'

export interface Post {
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
  visibility?: 'public' | 'unlisted' | 'followers' | 'private'
  contentWarning?: string
  isSensitive?: boolean
  repostedBy?: {
    id: string
    name: string
    handle: string
    avatar?: string
  }
}

interface TimelineResponse {
  posts: Post[]
  next?: string
  prev?: string
}

export interface MicroblogContextType {
  posts: Post[]
  loading: boolean
  error: string | null
  hasMore: boolean
  currentFilter: 'all' | 'following' | 'local' | 'federated'
  currentSort: 'latest' | 'popular' | 'trending'
  addPost: (post: Post) => void
  updatePost: (id: string, updates: Partial<Post>) => void
  deletePost: (id: string) => void
  likePost: (id: string) => Promise<void>
  repostPost: (id: string) => Promise<void>
  unrepostPost: (id: string) => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  setFilter: (filter: 'all' | 'following' | 'local' | 'federated') => void
  setSort: (sort: 'latest' | 'popular' | 'trending') => void
}

export const MicroblogContext = createContext<MicroblogContextType | undefined>(undefined)

interface MicroblogProviderProps {
  children: ReactNode
  userId?: string
}

export function MicroblogProvider({ children, userId }: MicroblogProviderProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [currentFilter, setCurrentFilter] = useState<'all' | 'following' | 'local' | 'federated'>('all')
  const [currentSort, setCurrentSort] = useState<'latest' | 'popular' | 'trending'>('latest')

  // Fetch timeline posts
  const fetchPosts = useCallback(async (append: boolean = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: '20',
        ...(append && nextCursor ? { cursor: nextCursor } : {}),
        ...(currentFilter !== 'all' ? { filter: currentFilter } : {}),
        ...(currentSort !== 'latest' ? { sort: currentSort } : {})
      })

      const response = await fetch(
        apiUrl(`${API_ENDPOINTS.microblog.timeline}?${params.toString()}`),
        { credentials: 'include' }
      )

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        let errorMessage = `Failed to fetch timeline: ${response.status}`

        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorData.error || errorMessage
          } catch {
            // If JSON parsing fails, use default message
          }
        }
        throw new Error(errorMessage)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data: TimelineResponse = await response.json()
        const newPosts = data.posts || []

        setPosts(prevPosts => {
          if (append) {
            // Append for infinite scroll
            const combined = [...prevPosts, ...newPosts]
            // Remove duplicates
            const unique = combined.reduce((acc, post) => {
              if (!acc.find(p => p.id === post.id)) {
                acc.push(post)
              }
              return acc
            }, [] as Post[])
            return unique
          } else {
            // Replace for refresh
            return newPosts
          }
        })

        setNextCursor(data.next)
        setHasMore(!!data.next)
      }
    } catch (err) {
      console.error('Error fetching timeline:', err)
      setError(err instanceof Error ? err.message : 'Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }, [nextCursor, currentFilter, currentSort])

  // Initial load
  useEffect(() => {
    fetchPosts(false)
  }, [currentFilter, currentSort]) // Refetch when filter or sort changes

  // Add a new post to the top of the timeline
  const addPost = useCallback((post: Post) => {
    setPosts(prevPosts => [post, ...prevPosts])
  }, [])

  // Update an existing post
  const updatePost = useCallback((id: string, updates: Partial<Post>) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === id ? { ...post, ...updates } : post
      )
    )
  }, [])

  // Delete a post
  const deletePost = useCallback((id: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== id))
  }, [])

  // Like/unlike a post (optimistic update)
  const likePost = useCallback(async (postId: string) => {
    // Find the post to get current state
    const post = posts.find(p => p.id === postId)
    if (!post) return

    // Optimistic update
    updatePost(postId, {
      liked: !post.liked,
      likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1
    })

    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.microblog.likePost(postId)), {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        // Revert on error
        updatePost(postId, {
          liked: post.liked,
          likeCount: post.likeCount
        })
        throw new Error('Failed to like post')
      }
    } catch (err) {
      console.error('Error liking post:', err)
      // Revert already done above
    }
  }, [posts, updatePost])

  // Repost a post (optimistic update)
  const repostPost = useCallback(async (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    // Optimistic update
    updatePost(postId, {
      reposted: true,
      repostCount: post.repostCount + 1
    })

    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.microblog.repost(postId)), {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        // Revert on error
        updatePost(postId, {
          reposted: post.reposted,
          repostCount: post.repostCount
        })
        throw new Error('Failed to repost')
      }
    } catch (err) {
      console.error('Error reposting:', err)
    }
  }, [posts, updatePost])

  // Unrepost a post (optimistic update)
  const unrepostPost = useCallback(async (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    // Optimistic update
    updatePost(postId, {
      reposted: false,
      repostCount: Math.max(0, post.repostCount - 1)
    })

    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.microblog.unrepost(postId)), {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        // Revert on error
        updatePost(postId, {
          reposted: post.reposted,
          repostCount: post.repostCount
        })
        throw new Error('Failed to unrepost')
      }
    } catch (err) {
      console.error('Error unreposting:', err)
    }
  }, [posts, updatePost])

  // Load more posts (infinite scroll)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    await fetchPosts(true)
  }, [hasMore, loading, fetchPosts])

  // Refresh timeline (pull to refresh)
  const refresh = useCallback(async () => {
    setNextCursor(undefined)
    setHasMore(true)
    await fetchPosts(false)
  }, [fetchPosts])

  // Set filter
  const setFilter = useCallback((filter: 'all' | 'following' | 'local' | 'federated') => {
    setCurrentFilter(filter)
    setNextCursor(undefined)
    setHasMore(true)
  }, [])

  // Set sort
  const setSort = useCallback((sort: 'latest' | 'popular' | 'trending') => {
    setCurrentSort(sort)
    setNextCursor(undefined)
    setHasMore(true)
  }, [])

  const value: MicroblogContextType = {
    posts,
    loading,
    error,
    hasMore,
    currentFilter,
    currentSort,
    addPost,
    updatePost,
    deletePost,
    likePost,
    repostPost,
    unrepostPost,
    loadMore,
    refresh,
    setFilter,
    setSort,
  }

  return (
    <MicroblogContext.Provider value={value}>
      {children}
    </MicroblogContext.Provider>
  )
}
