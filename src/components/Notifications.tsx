import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiUrl, API_ENDPOINTS } from '../utils/api';
import './Notifications.css';

interface Notification {
  id: string;
  userId: string;
  type: 'follow' | 'like' | 'repost' | 'reply' | 'mention';
  actorId: string;
  actorName: string;
  postId?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsProps {
  userId: string;
}

const Notifications: React.FC<NotificationsProps> = ({ userId }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = React.useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        apiUrl(`${API_ENDPOINTS.microblog.notifications.base}?userId=${userId}&limit=20`)
      );
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else if (response.status === 404) {
        // Endpoint not implemented yet - silently handle
        setNotifications([]);
      }
    } catch (error) {
      // Only log non-404 errors
      if (error instanceof Error && !error.message.includes('404')) {
      console.error('Error fetching notifications:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchUnreadCount = React.useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        apiUrl(`${API_ENDPOINTS.microblog.notifications.unreadCount}?userId=${userId}`)
      );
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      } else if (response.status === 404) {
        // Endpoint not implemented yet - silently handle
        setUnreadCount(0);
      }
    } catch (error) {
      // Only log non-404 errors
      if (error instanceof Error && !error.message.includes('404')) {
      console.error('Error fetching unread count:', error);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
        if (isOpen) {
          fetchNotifications();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [userId, isOpen, fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        apiUrl(`${API_ENDPOINTS.microblog.notifications.markRead(notificationId)}?userId=${userId}`),
        { method: 'POST' }
      );
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        apiUrl(`${API_ENDPOINTS.microblog.notifications.markAllRead}?userId=${userId}`),
        { method: 'POST' }
      );
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationText = (notification: Notification): string => {
    switch (notification.type) {
      case 'follow':
        return t('microblog.notifications.follow', { name: notification.actorName || 'Someone' });
      case 'like':
        return t('microblog.notifications.like', { name: notification.actorName || 'Someone' });
      case 'repost':
        return t('microblog.notifications.repost', { name: notification.actorName || 'Someone' });
      case 'reply':
        return t('microblog.notifications.reply', { name: notification.actorName || 'Someone' });
      case 'mention':
        return t('microblog.notifications.mention', { name: notification.actorName || 'Someone' });
      default:
        return '';
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('microblog.time.justNow');
    if (minutes < 60) return t('microblog.time.minutesAgo', { count: minutes });
    if (hours < 24) return t('microblog.time.hoursAgo', { count: hours });
    if (days < 7) return t('microblog.time.daysAgo', { count: days });
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="notifications-container">
      <button
        className="notifications-toggle"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
      >
        <img 
          src="/imgs/from_abyss_bells.png" 
          alt="Notifications" 
          className="notifications-icon"
        />
        {unreadCount > 0 && <span className="notifications-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>{t('microblog.notifications.title')}</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">
                {t('microblog.notifications.markAllRead')}
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="notifications-loading">{t('microblog.loading')}</div>
          ) : notifications.length === 0 ? (
            <div className="notifications-empty">{t('microblog.notifications.empty')}</div>
          ) : (
            <div className="notifications-list">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                >
                  <div 
                    className="notification-content"
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="notification-text">{getNotificationText(notification)}</div>
                    <div className="notification-time">{formatTime(notification.createdAt)}</div>
                  </div>
                  {notification.type === 'follow' && !notification.read && (
                    <div className="notification-actions">
                      <span className="notification-hint">
                        {t('microblog.notifications.followHint', 'Check pending requests to approve')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
