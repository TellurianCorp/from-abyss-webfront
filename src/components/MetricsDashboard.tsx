import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiUrl, API_ENDPOINTS } from '../utils/api';
import './MetricsDashboard.css';

interface SyncMetrics {
  lastSyncTime: string;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  postsSynced: number;
  actorsSynced: number;
  averageSyncTime: number;
  lastError?: string;
}

interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  rateLimitHits: number;
  invalidSignatures: number;
  replayAttempts: number;
  requestsByInstance: Record<string, number>;
}

interface DatabaseStats {
  posts: number;
  actors: number;
  followers: number;
  unreadNotifications: number;
}

const MetricsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [syncMetrics, setSyncMetrics] = useState<SyncMetrics | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sync' | 'security' | 'database'>('sync');

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const [syncRes, securityRes, dbRes] = await Promise.all([
        fetch(apiUrl(API_ENDPOINTS.microblog.metrics.sync)),
        fetch(apiUrl(API_ENDPOINTS.microblog.metrics.security)),
        fetch(apiUrl(API_ENDPOINTS.microblog.metrics.database)),
      ]);

      if (syncRes.ok) {
        const syncData = await syncRes.json();
        setSyncMetrics(syncData);
      } else if (syncRes.status !== 404) {
        console.error('Error fetching sync metrics:', syncRes.status, syncRes.statusText);
      }

      if (securityRes.ok) {
        const securityData = await securityRes.json();
        setSecurityMetrics(securityData);
      } else if (securityRes.status !== 404) {
        console.error('Error fetching security metrics:', securityRes.status, securityRes.statusText);
      }

      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setDbStats(dbData);
      } else if (dbRes.status !== 404) {
        console.error('Error fetching database metrics:', dbRes.status, dbRes.statusText);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return t('metrics.never');
    const date = new Date(timeString);
    return date.toLocaleString();
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
    return `${seconds.toFixed(2)}s`;
  };

  if (isLoading) {
    return <div className="metrics-loading">{t('microblog.loading')}</div>;
  }

  return (
    <div className="metrics-dashboard">
      <div className="metrics-tabs">
        <button
          className={activeTab === 'sync' ? 'active' : ''}
          onClick={() => setActiveTab('sync')}
        >
          {t('metrics.sync.title')}
        </button>
        <button
          className={activeTab === 'security' ? 'active' : ''}
          onClick={() => setActiveTab('security')}
        >
          {t('metrics.security.title')}
        </button>
        <button
          className={activeTab === 'database' ? 'active' : ''}
          onClick={() => setActiveTab('database')}
        >
          {t('metrics.database.title')}
        </button>
      </div>

      <div className="metrics-content">
        {activeTab === 'sync' && (
          syncMetrics ? (
            <div className="metrics-section">
              <h3>{t('metrics.sync.title')}</h3>
              <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">{t('metrics.sync.lastSyncTime')}</div>
                <div className="metric-value">{formatTime(syncMetrics.lastSyncTime)}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t('metrics.sync.totalSyncs')}</div>
                <div className="metric-value">{syncMetrics.totalSyncs}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t('metrics.sync.successfulSyncs')}</div>
                <div className="metric-value success">{syncMetrics.successfulSyncs}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t('metrics.sync.failedSyncs')}</div>
                <div className="metric-value error">{syncMetrics.failedSyncs}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t('metrics.sync.postsSynced')}</div>
                <div className="metric-value">{syncMetrics.postsSynced}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t('metrics.sync.actorsSynced')}</div>
                <div className="metric-value">{syncMetrics.actorsSynced}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t('metrics.sync.averageSyncTime')}</div>
                <div className="metric-value">{formatDuration(syncMetrics.averageSyncTime)}</div>
              </div>
            </div>
            {syncMetrics.lastError && (
              <div className="metric-error">
                <strong>{t('metrics.sync.lastError')}:</strong> {syncMetrics.lastError}
              </div>
            )}
          </div>
          ) : (
            <div className="metrics-section">
              <p className="metrics-unavailable">{t('metrics.unavailable', 'Metrics endpoint not available')}</p>
            </div>
          )
        )}

        {activeTab === 'security' && (
          securityMetrics ? (
            <div className="metrics-section">
              <h3>{t('metrics.security.title')}</h3>
              <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">{t('metrics.security.totalRequests')}</div>
                <div className="metric-value">{securityMetrics.totalRequests}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t('metrics.security.blockedRequests')}</div>
                <div className="metric-value error">{securityMetrics.blockedRequests}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t('metrics.security.rateLimitHits')}</div>
                <div className="metric-value warning">{securityMetrics.rateLimitHits}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t('metrics.security.invalidSignatures')}</div>
                <div className="metric-value error">{securityMetrics.invalidSignatures}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t('metrics.security.replayAttempts')}</div>
                <div className="metric-value error">{securityMetrics.replayAttempts}</div>
              </div>
            </div>
            {Object.keys(securityMetrics.requestsByInstance).length > 0 && (
              <div className="metrics-instances">
                <h4>{t('metrics.security.requestsByInstance')}</h4>
                <div className="instances-list">
                  {Object.entries(securityMetrics.requestsByInstance)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([instance, count]) => (
                      <div key={instance} className="instance-item">
                        <span className="instance-name">{instance}</span>
                        <span className="instance-count">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          ) : (
            <div className="metrics-section">
              <p className="metrics-unavailable">{t('metrics.unavailable', 'Metrics endpoint not available')}</p>
            </div>
          )
        )}

        {activeTab === 'database' && (
          dbStats ? (
            <div className="metrics-section">
              <h3>{t('metrics.database.title')}</h3>
              <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">{t('metrics.database.posts')}</div>
                <div className="metric-value">{dbStats.posts}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t('metrics.database.actors')}</div>
                <div className="metric-value">{dbStats.actors}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t('metrics.database.followers')}</div>
                <div className="metric-value">{dbStats.followers}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">{t('metrics.database.unreadNotifications')}</div>
                <div className="metric-value">{dbStats.unreadNotifications}</div>
              </div>
            </div>
          </div>
          ) : (
            <div className="metrics-section">
              <p className="metrics-unavailable">{t('metrics.unavailable', 'Metrics endpoint not available')}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MetricsDashboard;
