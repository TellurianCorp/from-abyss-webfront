import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './PatreonManagement.css'

interface PatreonUser {
  id: string
  email: string
  full_name: string
}

interface PatreonCampaign {
  id: string
  creation_name: string
  summary: string
  patron_count: number
}

interface PatreonStats {
  total_campaigns: number
  total_patrons: number
}

export function PatreonManagement() {
  const { t } = useTranslation()
  const [user, setUser] = useState<PatreonUser | null>(null)
  const [campaigns, setCampaigns] = useState<PatreonCampaign[]>([])
  const [stats, setStats] = useState<PatreonStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_BASE = '/api/v1/patreon'

  useEffect(() => {
    fetchPatreonData()
  }, [])

  const fetchPatreonData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch user info
      const userResponse = await fetch(`${API_BASE}/user`)
      if (userResponse.ok) {
        try {
          const userData = await userResponse.json()
          if (userData.data?.attributes) {
            setUser({
              id: userData.data.id,
              email: userData.data.attributes.email || '',
              full_name: userData.data.attributes.full_name || '',
            })
          }
        } catch (parseErr) {
          console.error('Failed to parse user response:', parseErr)
        }
      } else if (userResponse.status === 404) {
        setError('Patreon integration is not configured. Please check your API credentials.')
        setLoading(false)
        return
      } else {
        const errorData = await userResponse.json().catch(() => ({}))
        console.error('Failed to fetch user info:', userResponse.status, errorData)
      }

      // Fetch campaigns
      const campaignsResponse = await fetch(`${API_BASE}/campaigns`)
      if (campaignsResponse.ok) {
        try {
          const campaignsData = await campaignsResponse.json()
          if (campaignsData.data) {
            setCampaigns(
              campaignsData.data.map((campaign: any) => ({
                id: campaign.id,
                creation_name: campaign.attributes?.creation_name || '',
                summary: campaign.attributes?.summary || '',
                patron_count: campaign.attributes?.patron_count || 0,
              }))
            )
          }
        } catch (parseErr) {
          console.error('Failed to parse campaigns response:', parseErr)
        }
      }

      // Fetch stats
      const statsResponse = await fetch(`${API_BASE}/stats`)
      if (statsResponse.ok) {
        try {
          const statsData = await statsResponse.json()
          setStats({
            total_campaigns: statsData.total_campaigns || 0,
            total_patrons: statsData.total_patrons || 0,
          })
        } catch (parseErr) {
          console.error('Failed to parse stats response:', parseErr)
        }
      }
    } catch (err) {
      setError(t('patreon.error.fetchFailed') || 'Failed to fetch Patreon data')
      console.error('Failed to fetch Patreon data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchPatreonData()
  }

  if (loading) {
    return (
      <section className="admin-panel patreon">
        <h3>{t('patreon.admin.title')}</h3>
        <p>{t('patreon.loading')}</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="admin-panel patreon">
        <h3>{t('patreon.admin.title')}</h3>
        <p className="patreon-error">{error}</p>
        <button className="patreon-btn" onClick={handleRefresh}>
          {t('patreon.retry')}
        </button>
      </section>
    )
  }

  return (
    <section className="admin-panel patreon">
      <div className="patreon-header">
        <h3>{t('patreon.admin.title')}</h3>
        <button className="patreon-refresh-btn" onClick={handleRefresh} title={t('patreon.refresh')}>
          ↻
        </button>
      </div>

      {user && (
        <div className="patreon-user">
          <p className="patreon-user-name">{user.full_name}</p>
          <p className="patreon-user-email">{user.email}</p>
        </div>
      )}

      {stats && (
        <div className="patreon-stats">
          <article>
            <p className="patreon-stat-label">{t('patreon.stats.campaigns')}</p>
            <strong>{stats.total_campaigns}</strong>
          </article>
          <article>
            <p className="patreon-stat-label">{t('patreon.stats.patrons')}</p>
            <strong>{stats.total_patrons}</strong>
          </article>
        </div>
      )}

      {campaigns.length > 0 && (
        <div className="patreon-campaigns">
          <h4>{t('patreon.campaigns.title')}</h4>
          <ul className="patreon-campaign-list">
            {campaigns.map((campaign) => (
              <li key={campaign.id} className="patreon-campaign-item">
                <strong>{campaign.creation_name}</strong>
                <span>{campaign.patron_count} {t('patreon.campaigns.patrons')}</span>
                {campaign.summary && <p className="patreon-campaign-summary">{campaign.summary}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="patreon-actions">
        <Link className="patreon-btn" to="/admin/patreon">
          {t('patreon.admin.openManagement')}
        </Link>
      </div>
    </section>
  )
}
