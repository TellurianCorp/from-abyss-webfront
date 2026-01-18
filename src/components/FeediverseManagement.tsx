import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import { HighlightedProfilesManagement } from './HighlightedProfilesManagement'
import './FeediverseManagement.css'

interface FeediverseStats {
  totalItems: number
  lastSync: string
  activeSources: number
}

export function FeediverseManagement() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<FeediverseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'stats' | 'profiles'>('stats')

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats()
    }
  }, [activeTab])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(apiUrl(API_ENDPOINTS.feediverse.horror))
      
      if (!response.ok) {
        if (response.status === 404) {
          setStats(null)
          return
        }
        throw new Error(`Failed to fetch Feediverse stats: ${response.status}`)
      }

      const data = await response.json()
      setStats({
        totalItems: data.count || data.data?.length || 0,
        lastSync: new Date().toISOString(),
        activeSources: 1,
      })
    } catch (err) {
      console.error('Error fetching Feediverse stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load Feediverse data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="feediverse-management">
      <div className="feediverse-tabs">
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
        <button
          className={activeTab === 'profiles' ? 'active' : ''}
          onClick={() => setActiveTab('profiles')}
        >
          Highlighted Profiles
        </button>
      </div>

      {activeTab === 'stats' && (
        <>
          {loading ? (
            <div className="feediverse-loading">
              <p>{t('feediverse.admin.loading', 'Loading Feediverse data...')}</p>
            </div>
          ) : error ? (
            <div className="feediverse-error">
              <p>{error}</p>
              <button onClick={fetchStats} className="feediverse-btn feediverse-btn-primary">
                {t('feediverse.admin.retry', 'Retry')}
              </button>
            </div>
          ) : (
            <>
              {stats && (
                <div className="feediverse-stats">
                  <div className="feediverse-stat-item">
                    <span className="feediverse-stat-label">{t('feediverse.admin.stats.totalItems', 'Total Items')}</span>
                    <strong className="feediverse-stat-value">{stats.totalItems}</strong>
                  </div>
                  <div className="feediverse-stat-item">
                    <span className="feediverse-stat-label">{t('feediverse.admin.stats.activeSources', 'Active Sources')}</span>
                    <strong className="feediverse-stat-value">{stats.activeSources}</strong>
                  </div>
                </div>
              )}
              <div className="feediverse-actions">
                <button onClick={fetchStats} className="feediverse-btn feediverse-btn-primary">
                  {t('feediverse.admin.refresh', 'Refresh')}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {activeTab === 'profiles' && <HighlightedProfilesManagement />}
    </div>
  )
}
