import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Post as PostType } from '../../contexts/MicroblogContext'
import { PostCard } from './PostCard'
import { PostActions } from './PostActions'
import { PostMetadata } from './PostMetadata'
import { MediaGallery } from './MediaGallery'
import { RepostIndicator } from './RepostIndicator'
import styles from './Post.module.css'

interface PostProps {
  post: PostType
  currentUserId?: string
  onLike?: (postId: string) => void
  onReply?: (post: PostType) => void
  onRepost?: (postId: string) => void
  onUnrepost?: (postId: string) => void
  onDelete?: (postId: string) => void
  onBookmark?: (postId: string) => void
  highlighted?: boolean
  showThread?: boolean
}

export function Post({
  post,
  currentUserId,
  onLike,
  onReply,
  onRepost,
  onUnrepost,
  onDelete,
  onBookmark,
  highlighted = false,
  showThread = false
}: PostProps) {
  const { t } = useTranslation()

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return t('microblog.time.justNow')
    if (diffInSeconds < 3600) return t('microblog.time.minutesAgo', { count: Math.floor(diffInSeconds / 60) })
    if (diffInSeconds < 86400) return t('microblog.time.hoursAgo', { count: Math.floor(diffInSeconds / 3600) })
    if (diffInSeconds < 604800) return t('microblog.time.daysAgo', { count: Math.floor(diffInSeconds / 86400) })

    return date.toLocaleDateString()
  }, [t])

  const isOwnPost = currentUserId && post.authorId === currentUserId

  return (
    <PostCard highlighted={highlighted}>
      {/* Repost indicator if this is a repost */}
      {post.repostedBy && (
        <RepostIndicator
          userName={post.repostedBy.name}
          userHandle={post.repostedBy.handle}
          userAvatar={post.repostedBy.avatar}
        />
      )}

      {/* Content Warning */}
      {post.isSensitive && post.contentWarning && (
        <div className={styles.contentWarning}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>{post.contentWarning}</span>
        </div>
      )}

      <div className={styles.postHeader}>
        {/* Author avatar */}
        <div className={styles.avatarContainer}>
          {post.authorAvatar ? (
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className={styles.avatar}
              loading="lazy"
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {post.authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Author info and metadata */}
        <div className={styles.authorInfo}>
          <div className={styles.authorMeta}>
            <span className={styles.authorName}>{post.authorName}</span>
            <span className={styles.authorHandle}>{post.authorHandle}</span>
            <span className={styles.timestamp}>
              <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            </span>
          </div>

          {/* Post metadata (federation badge, visibility) */}
          <PostMetadata
            federated={post.federated}
            source={post.source}
            visibility={post.visibility}
          />
        </div>

        {/* Actions menu (delete, etc.) */}
        {isOwnPost && onDelete && (
          <button
            className={styles.deleteButton}
            onClick={() => onDelete(post.id)}
            aria-label={t('microblog.delete.label')}
            title={t('microblog.delete.label')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>

      {/* Post content */}
      <div className={styles.postContent}>
        <p className={styles.contentText}>{post.content}</p>

        {/* Media gallery if media is present */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <MediaGallery mediaUrls={post.mediaUrls} />
        )}
      </div>

      {/* Post actions (like, reply, repost, share) */}
      <PostActions
        post={post}
        onLike={onLike}
        onReply={onReply}
        onRepost={post.reposted ? onUnrepost : onRepost}
        onBookmark={onBookmark}
      />

      {/* Thread indicator */}
      {showThread && post.threadId && (
        <div className={styles.threadIndicator}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span>{t('microblog.viewThread')}</span>
        </div>
      )}
    </PostCard>
  )
}
