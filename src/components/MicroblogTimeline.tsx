import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMicroblog } from '../hooks/useMicroblog'
import { Post } from './microblog/Post'
import { PostComposer } from './PostComposer'
import PendingFollowRequests from './PendingFollowRequests'
import Notifications from './Notifications'
import './MicroblogTimeline.css'

interface MicroblogTimelineProps {
  userId?: string
}

export function MicroblogTimeline({ userId }: MicroblogTimelineProps) {
  const { t } = useTranslation()
  const {
    posts,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
    likePost,
    repostPost,
    unrepostPost,
    deletePost: deletePostFromContext
  } = useMicroblog()

  // Refresh timeline when component mounts
  useEffect(() => {
    refresh()
  }, [refresh])

  const handlePostCreated = () => {
    refresh()
  }

  const handleDelete = async (postId: string) => {
    if (!window.confirm(t('microblog.delete.confirm'))) {
      return
    }

    try {
      deletePostFromContext(postId)
    } catch (err) {
      console.error('Error deleting post:', err)
      alert(t('microblog.delete.error'))
    }
  }

  const handleRepost = async (postId: string, isReposted: boolean) => {
    if (isReposted) {
      await unrepostPost(postId)
    } else {
      await repostPost(postId)
    }
  }

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return

      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop
      const clientHeight = document.documentElement.clientHeight

      // Load more when user is 500px from bottom
      if (scrollHeight - scrollTop - clientHeight < 500) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore, loadMore])

  if (loading && posts.length === 0) {
    return (
      <div className="microblog-timeline">
        <div className="microblog-loading">
          <div className="spinner"></div>
          <p>{t('microblog.loading')}</p>
        </div>
      </div>
    )
  }

  if (error && posts.length === 0) {
    return (
      <div className="microblog-timeline">
        <div className="microblog-error">
          <p>{t('microblog.error')}</p>
          <button onClick={refresh} className="retry-button">
            {t('microblog.retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="microblog-timeline">
      {/* Pending follow requests */}
      <PendingFollowRequests onUpdate={refresh} />

      {/* Header with notifications */}
      <div className="microblog-header">
        <div className="header-content">
          <div>
            <h2>{t('microblog.title')}</h2>
            <p>{t('microblog.description')}</p>
          </div>
          {userId && <Notifications userId={userId} />}
        </div>
      </div>

      {/* Post composer */}
      {userId && <PostComposer onPostCreated={handlePostCreated} />}

      {/* Timeline posts */}
      <div className="microblog-posts">
        {posts.length === 0 ? (
          <div className="microblog-empty">
            <p>{t('microblog.empty')}</p>
          </div>
        ) : (
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              currentUserId={userId}
              onLike={() => likePost(post.id)}
              onRepost={() => handleRepost(post.id, post.reposted || false)}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Loading more indicator */}
      {loading && posts.length > 0 && (
        <div className="microblog-loading-more">
          <div className="spinner"></div>
          <p>{t('microblog.loadingMore', 'Loading more...')}</p>
        </div>
      )}

      {/* End of feed indicator */}
      {!hasMore && posts.length > 0 && (
        <div className="microblog-end">
          <p>{t('microblog.endOfFeed', 'You\'ve reached the end')}</p>
        </div>
      )}
    </div>
  )
}
