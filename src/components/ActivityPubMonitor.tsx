import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { apiUrl, API_ENDPOINTS } from '../utils/api';
import './ActivityPubMonitor.css';

interface ActivityRequestLog {
  timestamp: string;
  type: string;
  actor: string;
  object?: string;
  status: 'success' | 'error' | 'pending';
  error?: string;
  response_time_ms?: number;
}

interface ActivityLogsResponse {
  logs: ActivityRequestLog[];
  total: number;
  recent_count: number;
  status_counts: {
    success: number;
    error: number;
    pending: number;
  };
  has_activity: boolean;
}

const ActivityPubMonitor: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<ActivityRequestLog[]>([]);
  const [hasActivity, setHasActivity] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [statusCounts, setStatusCounts] = useState({ success: 0, error: 0, pending: 0 });

  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.activitypub.requestLogs), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }

      const data: ActivityLogsResponse = await response.json();
      setLogs(data.logs || []);
      setHasActivity(data.has_activity || false);
      setStatusCounts(data.status_counts || { success: 0, error: 0, pending: 0 });
      
      // Trigger rotation animation if there's recent activity
      if (data.has_activity) {
        setIsRotating(true);
        setTimeout(() => setIsRotating(false), 2000); // Stop rotation after 2 seconds
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching activity logs:', err);
      setError(err.message || 'Failed to fetch activity logs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    
    // Poll every 5 seconds for new activity
    const interval = setInterval(fetchLogs, 5000);
    
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) {
      return `${diffSecs}s ago`;
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'var(--success, #4caf50)';
      case 'error':
        return 'var(--blood, #b03a3a)';
      case 'pending':
        return 'var(--warning, #ff9800)';
      default:
        return 'var(--muted, #666)';
    }
  };

  return (
    <div className="activitypub-monitor">
      <div className="activitypub-monitor-header">
        <div className="activitypub-monitor-title">
          <img
            src="/imgs/logo.png"
            alt="From Abyss"
            className={`activitypub-monitor-logo ${isRotating ? 'rotating' : ''}`}
          />
          <h3>{t('admin.activitypubMonitor.title', 'ActivityPub Monitor')}</h3>
        </div>
        {hasActivity && (
          <span className="activitypub-monitor-badge">
            {statusCounts.error > 0 && (
              <span className="error-badge">{statusCounts.error}</span>
            )}
            {statusCounts.success > 0 && (
              <span className="success-badge">{statusCounts.success}</span>
            )}
          </span>
        )}
      </div>

      {error && (
        <div className="activitypub-monitor-error">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="activitypub-monitor-loading">
          {t('admin.activitypubMonitor.loading', 'Loading...')}
        </div>
      ) : logs.length === 0 ? (
        <div className="activitypub-monitor-empty">
          {t('admin.activitypubMonitor.noActivity', 'No recent activity')}
        </div>
      ) : (
        <div className="activitypub-monitor-logs">
          {logs.slice(0, 10).map((log, index) => (
            <div key={index} className="activitypub-monitor-log-item">
              <div className="log-item-header">
                <span className="log-item-type">{log.type}</span>
                <span className="log-item-time">{formatTimestamp(log.timestamp)}</span>
              </div>
              <div className="log-item-details">
                <span className="log-item-actor" title={log.actor}>
                  {log.actor.split('/').pop() || log.actor}
                </span>
                {log.object && (
                  <span className="log-item-object" title={log.object}>
                    → {log.object.split('/').pop() || log.object}
                  </span>
                )}
                {log.response_time_ms && (
                  <span className="log-item-time-ms">{log.response_time_ms}ms</span>
                )}
              </div>
              <div className="log-item-status">
                <span
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(log.status) }}
                />
                <span className="status-text">{log.status}</span>
                {log.error && (
                  <span className="log-item-error" title={log.error}>
                    ⚠ {log.error.substring(0, 50)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityPubMonitor;
