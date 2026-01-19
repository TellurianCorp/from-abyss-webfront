import { useTranslation } from 'react-i18next'
import styles from './RepostIndicator.module.css'

interface RepostIndicatorProps {
  userName: string
  userHandle: string
  userAvatar?: string
}

export function RepostIndicator({ userName, userHandle, userAvatar }: RepostIndicatorProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.repostIndicator}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
      {userAvatar && (
        <img src={userAvatar} alt={userName} className={styles.avatar} />
      )}
      <span>
        {t('microblog.repostedBy', { name: userName })}
      </span>
    </div>
  )
}
