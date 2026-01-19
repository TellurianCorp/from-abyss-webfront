import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { apiUrl, API_ENDPOINTS } from '../../utils/api'
import { WidgetCard } from './WidgetCard'
import styles from './SuggestedFollows.module.css'

interface SuggestedUser {
  id: string
  name: string
  handle: string
  avatar?: string
  bio?: string
  federated: boolean
}

export function SuggestedFollows() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(apiUrl(API_ENDPOINTS.microblog.suggestions), {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setUsers(data.users || [])
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [])

  const icon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )

  return (
    <WidgetCard
      title={t('suggested.title', 'Who to follow')}
      icon={icon}
      action={
        <Link to="/discover" className={styles.viewMoreLink}>
          {t('common.showMore', 'Show more')}
        </Link>
      }
    >
      {loading ? (
        <div className={styles.loading}>
          <div className="spinner"></div>
        </div>
      ) : users.length === 0 ? (
        <div className={styles.empty}>
          <p>{t('suggested.empty', 'No suggestions available')}</p>
        </div>
      ) : (
        <div className={styles.userList}>
          {users.slice(0, 5).map((user) => (
            <div key={user.id} className={styles.userItem}>
              <Link to={`/profile/${user.handle}`} className={styles.userInfo}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={styles.userDetails}>
                  <div className={styles.userName}>
                    {user.name}
                    {user.federated && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.federatedIcon}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    )}
                  </div>
                  <div className={styles.userHandle}>{user.handle}</div>
                  {user.bio && (
                    <div className={styles.userBio}>{user.bio}</div>
                  )}
                </div>
              </Link>
              <button className={styles.followButton}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
