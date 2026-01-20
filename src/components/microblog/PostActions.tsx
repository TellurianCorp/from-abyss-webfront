import { useTranslation } from 'react-i18next'
import { type Post } from '../../contexts/MicroblogContext'
import styles from './PostActions.module.css'

interface PostActionsProps {
  post: Post
  onLike?: (postId: string) => void
  onReply?: (post: Post) => void
  onRepost?: (postId: string) => void
  onBookmark?: (postId: string) => void
}

export function PostActions({
  post,
  onLike,
  onReply,
  onRepost,
  onBookmark
}: PostActionsProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.postActions}>
      {/* Like button */}
      <button
        className={`${styles.actionButton} ${post.liked ? styles.liked : ''}`}
        onClick={() => onLike?.(post.id)}
        aria-label={t('microblog.like')}
        title={t('microblog.like')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={post.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className={styles.count}>{post.likeCount || 0}</span>
      </button>

      {/* Reply button */}
      <button
        className={styles.actionButton}
        onClick={() => onReply?.(post)}
        aria-label={t('microblog.reply')}
        title={t('microblog.reply')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className={styles.count}>{post.replyCount || 0}</span>
      </button>

      {/* Repost button */}
      <button
        className={`${styles.actionButton} ${post.reposted ? styles.reposted : ''}`}
        onClick={() => onRepost?.(post.id)}
        aria-label={t('microblog.repost')}
        title={t('microblog.repost')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
        <span className={styles.count}>{post.repostCount || 0}</span>
      </button>

      {/* Share/Bookmark button */}
      <button
        className={styles.actionButton}
        onClick={() => onBookmark?.(post.id)}
        aria-label={t('microblog.bookmark')}
        title={t('microblog.bookmark')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  )
}
