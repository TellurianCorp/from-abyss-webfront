import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { NotificationDropdown } from './NotificationDropdown'
import styles from './NotificationBell.module.css'

interface NotificationBellProps {
  userId?: string
}

export function NotificationBell({}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const { unreadCount } = useNotifications()

  // Calculate dropdown position when opening or scrolling/resizing
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && bellRef.current) {
        const buttonRect = bellRef.current.getBoundingClientRect()
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
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        bellRef.current && !bellRef.current.contains(event.target as Node)
      ) {
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

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={styles.notificationBellContainer}>
      <button
        ref={bellRef}
        className={styles.notificationBell}
        onClick={toggleDropdown}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <img
          src="/imgs/from_abyss_bells.png"
          alt="Notifications"
          className={styles.bellIcon}
        />

        {unreadCount > 0 && (
          <span className={styles.badge} aria-label={`${unreadCount} unread notifications`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
            zIndex: 10000,
          }}
        >
          <NotificationDropdown onClose={() => setIsOpen(false)} />
        </div>,
        document.body
      )}
    </div>
  )
}
