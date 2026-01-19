import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiUrl } from '../utils/api'
import styles from './ProfileDropdown.module.css'

interface ProfileDropdownProps {
  userInfo: {
    id: string
    name?: string
    email?: string
    picture?: string
  }
  onLogout?: () => void
}

export function ProfileDropdown({ userInfo, onLogout }: ProfileDropdownProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })

  // Calculate dropdown position when opening or scrolling/resizing
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect()
        setMenuPosition({
          top: buttonRect.bottom + window.scrollY + 8, // 8px = 0.5rem
          right: window.innerWidth - buttonRect.right + window.scrollX,
        })
      }
    }

    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    try {
      await fetch(apiUrl('/v1/auth/logout'), {
        method: 'POST',
        credentials: 'include',
      })
      
      // Clear localStorage
      localStorage.removeItem('userInfo')
      
      // Call onLogout callback if provided
      if (onLogout) {
        onLogout()
      }
      
      // Redirect to home
      navigate('/')
      window.location.reload()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleProfileClick = () => {
    navigate('/profile')
    setIsOpen(false)
  }

  const dropdownMenu = isOpen ? (
    <div 
      className={styles.dropdownMenu}
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${menuPosition.top}px`,
        right: `${menuPosition.right}px`,
      }}
    >
      <div className={styles.dropdownHeader}>
        <div className={styles.userInfo}>
          <div className={styles.userName}>
            {userInfo.name || userInfo.email || 'User'}
          </div>
          {userInfo.email && userInfo.name && (
            <div className={styles.userEmail}>{userInfo.email}</div>
          )}
        </div>
      </div>
      
      <div className={styles.dropdownDivider} />
      
      <button
        className={styles.menuItem}
        onClick={handleProfileClick}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>{t('profile.edit', 'Edit Profile')}</span>
      </button>
      
      <div className={styles.dropdownDivider} />
      
      <button
        className={`${styles.menuItem} ${styles.menuItemDanger}`}
        onClick={handleLogout}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>{t('profile.logout', 'Logout')}</span>
      </button>
    </div>
  ) : null

  return (
    <div className={styles.dropdownContainer}>
      <button
        ref={buttonRef}
        className={styles.avatarButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('profile.menu', 'Profile menu')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {userInfo.picture ? (
          <img 
            src={userInfo.picture} 
            alt={userInfo.name || userInfo.email || 'User'} 
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {(userInfo.name || userInfo.email || 'U').charAt(0).toUpperCase()}
          </div>
        )}
      </button>
      
      {isOpen && typeof document !== 'undefined' && createPortal(dropdownMenu, document.body)}
    </div>
  )
}
