import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminNavbar } from '../components/AdminNavbar'
import { apiUrl, API_ENDPOINTS } from '../utils/api'

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

interface PatreonTier {
  id: string
  title: string
  description: string
  amount_cents: number
  patron_count: number
  published: boolean
  campaign_id: string
}

interface PatreonMember {
  id: string
  full_name: string
  email: string
  patron_status: string
  lifetime_support_cents: number
  currently_entitled_amount_cents: number
  last_charge_date: string | null
  last_charge_status: string | null
  pledge_relationship_start: string | null
  campaign_id: string
  tier_id: string | null
}

interface PatreonStats {
  total_campaigns: number
  total_patrons: number
}

export function AdminPatreon() {
  const { t } = useTranslation()
  const [user, setUser] = useState<PatreonUser | null>(null)
  const [campaigns, setCampaigns] = useState<PatreonCampaign[]>([])
  const [tiers, setTiers] = useState<Record<string, PatreonTier[]>>({})
  const [members, setMembers] = useState<Record<string, PatreonMember[]>>({})
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [showMembersForCampaign, setShowMembersForCampaign] = useState<string | null>(null)
  const [editingTier, setEditingTier] = useState<PatreonTier | null>(null)
  const [stats, setStats] = useState<PatreonStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  interface PatreonAPICampaign {
    id: string
    attributes?: {
      creation_name?: string
      summary?: string
      patron_count?: number
    }
  }

  interface PatreonAPITier {
    id: string
    attributes?: {
      title?: string
      description?: string
      amount_cents?: number
      patron_count?: number
      published?: boolean
    }
  }

  interface PatreonAPIMember {
    id: string
    attributes?: {
      full_name?: string
      email?: string
      patron_status?: string
      lifetime_support_cents?: number
      currently_entitled_amount_cents?: number
      last_charge_date?: string | null
      last_charge_status?: string | null
      pledge_relationship_start?: string | null
    }
    relationships?: {
      tier?: {
        data?: {
          id?: string
        }
      }
    }
  }

  const fetchPatreonData = React.useCallback(async (forceRefresh = false) => {
    setLoading(true)
    setError(null)

    try {
      const refreshParam = forceRefresh ? '?refresh=true' : ''

      // Fetch user info
      const userResponse = await fetch(apiUrl(`${API_ENDPOINTS.patreon.user}${refreshParam}`))
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
        if (userResponse.status === 500) {
          setError(errorData.message || 'Failed to fetch Patreon data. Please check your API configuration.')
        }
      }

      // Fetch campaigns
      const campaignsResponse = await fetch(apiUrl(`${API_ENDPOINTS.patreon.campaigns}${refreshParam}`))
      if (campaignsResponse.ok) {
        try {
          const campaignsData = await campaignsResponse.json()
          if (campaignsData.data) {
          const campaignsList = (campaignsData.data as PatreonAPICampaign[]).map((campaign) => ({
            id: campaign.id,
            creation_name: campaign.attributes?.creation_name || '',
            summary: campaign.attributes?.summary || '',
            patron_count: campaign.attributes?.patron_count || 0,
          }))
            setCampaigns(campaignsList)

            // Fetch tiers for each campaign
            for (const campaign of campaignsList) {
              fetchTiersForCampaign(campaign.id, forceRefresh)
            }
            
            // Optionally fetch members for all campaigns (can be done on demand)
            // for (const campaign of campaignsList) {
            //   fetchMembersForCampaign(campaign.id, forceRefresh)
            // }
          }
        } catch (parseErr) {
          console.error('Failed to parse campaigns response:', parseErr)
        }
      }

      // Fetch stats
      const statsResponse = await fetch(apiUrl(`${API_ENDPOINTS.patreon.stats}${refreshParam}`))
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

      setLastRefresh(new Date())
    } catch (err) {
      setError(t('patreon.error.fetchFailed') || 'Failed to fetch Patreon data')
      console.error('Failed to fetch Patreon data:', err)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchPatreonData()
  }, [fetchPatreonData])

  const fetchTiersForCampaign = async (campaignID: string, forceRefresh = false) => {
    try {
      const refreshParam = forceRefresh ? '?refresh=true' : ''
      const response = await fetch(apiUrl(`${API_ENDPOINTS.patreon.tiers(campaignID)}${refreshParam}`))
      if (response.ok) {
        const tiersData = await response.json()
        if (tiersData.data) {
          const tiersList = (tiersData.data as PatreonAPITier[]).map((tier) => ({
            id: tier.id,
            title: tier.attributes?.title || '',
            description: tier.attributes?.description || '',
            amount_cents: tier.attributes?.amount_cents || 0,
            patron_count: tier.attributes?.patron_count || 0,
            published: tier.attributes?.published || false,
            campaign_id: campaignID,
          }))
          setTiers((prev) => ({ ...prev, [campaignID]: tiersList }))
        }
      }
    } catch (err) {
      console.error(`Failed to fetch tiers for campaign ${campaignID}:`, err)
    }
  }

  const fetchMembersForCampaign = async (campaignID: string, forceRefresh = false) => {
    try {
      const refreshParam = forceRefresh ? '&refresh=true' : ''
      const response = await fetch(apiUrl(`${API_ENDPOINTS.patreon.members(campaignID)}?page_size=100${refreshParam}`))
      if (response.ok) {
        const membersData = await response.json()
        if (membersData.data) {
          const membersList = (membersData.data as PatreonAPIMember[]).map((member) => ({
            id: member.id,
            full_name: member.attributes?.full_name || '',
            email: member.attributes?.email || '',
            patron_status: member.attributes?.patron_status || '',
            lifetime_support_cents: member.attributes?.lifetime_support_cents || 0,
            currently_entitled_amount_cents: member.attributes?.currently_entitled_amount_cents || 0,
            last_charge_date: member.attributes?.last_charge_date || null,
            last_charge_status: member.attributes?.last_charge_status || null,
            pledge_relationship_start: member.attributes?.pledge_relationship_start || null,
            campaign_id: campaignID,
            tier_id: member.relationships?.tier?.data?.id || null,
          }))
          setMembers((prev) => ({ ...prev, [campaignID]: membersList }))
        }
      }
    } catch (err) {
      console.error(`Failed to fetch members for campaign ${campaignID}:`, err)
    }
  }

  const handleRefresh = () => {
    fetchPatreonData(true)
  }

  const handleClearCache = async () => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.patreon.cacheClear), {
        method: 'POST',
      })
      if (response.ok) {
        fetchPatreonData(true)
      } else {
        console.error('Failed to clear cache')
      }
    } catch (err) {
      console.error('Error clearing cache:', err)
    }
  }

  const handleEditTier = (tier: PatreonTier) => {
    setEditingTier(tier)
  }

  const handleSaveTier = async (updatedTier: PatreonTier) => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.patreon.updateTier(updatedTier.id)), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: updatedTier.title,
          description: updatedTier.description,
          amount_cents: updatedTier.amount_cents,
          published: updatedTier.published,
        }),
      })

      if (response.ok) {
        setEditingTier(null)
        // Refresh tiers after update
        if (updatedTier.campaign_id) {
          fetchTiersForCampaign(updatedTier.campaign_id, true)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to update tier:', errorData)
        alert(t('patreon.tiers.updateError') || 'Failed to update tier. Please try again.')
      }
    } catch (err) {
      console.error('Error updating tier:', err)
      alert(t('patreon.tiers.updateError') || 'Failed to update tier. Please try again.')
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleTimeString()
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  return (
    <div className="admin-page">
      <AdminNavbar />
      <div style={{ paddingTop: '100px' }}>
        {loading && (
          <section className="admin-panel">
            <p style={{ textAlign: 'center', color: 'var(--muted)' }}>
              {t('patreon.loading') || 'Loading Patreon data...'}
            </p>
          </section>
        )}

        {error && !loading && (
          <section className="admin-panel">
            <h3>{t('patreon.error.title') || 'Error'}</h3>
            <p style={{ color: 'var(--blood)' }}>{error}</p>
            <button className="admin-action-btn" onClick={handleRefresh} style={{ marginTop: '1rem' }}>
              {t('patreon.retry') || 'Retry'}
            </button>
          </section>
        )}

        {!loading && !error && (
          <>
            {/* Stats Metrics */}
            {stats && (
              <section className="admin-metrics">
                <article className="admin-metric-card">
                  <p className="admin-metric-label">{t('patreon.stats.campaigns') || 'Total Campaigns'}</p>
                  <h2>{stats.total_campaigns}</h2>
                </article>
                <article className="admin-metric-card">
                  <p className="admin-metric-label">{t('patreon.stats.patrons') || 'Total Patrons'}</p>
                  <h2>{stats.total_patrons}</h2>
                </article>
                {lastRefresh && (
                  <article className="admin-metric-card">
                    <p className="admin-metric-label">{t('patreon.lastRefresh') || 'Last Refreshed'}</p>
                    <h2 style={{ fontSize: '1rem' }}>{formatDate(lastRefresh)}</h2>
                  </article>
                )}
              </section>
            )}

            {/* User Info */}
            {user && (
              <section className="admin-panel">
                <h3>{t('patreon.user.title') || 'Account Information'}</h3>
                <ul>
                  <li>
                    <strong>{t('patreon.user.name') || 'Name'}:</strong> {user.full_name}
                  </li>
                  <li>
                    <strong>{t('patreon.user.email') || 'Email'}:</strong> {user.email}
                  </li>
                  <li>
                    <strong>{t('patreon.user.id') || 'User ID'}:</strong> <code>{user.id}</code>
                  </li>
                </ul>
              </section>
            )}

            {/* Campaigns */}
            {campaigns.length > 0 && (
              <section className="admin-panel">
                <h3>{t('patreon.campaigns.title') || 'Campaigns'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      style={{
                        background: 'rgba(12, 12, 12, 0.7)',
                        borderRadius: '8px',
                        padding: '1rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setSelectedCampaign(selectedCampaign === campaign.id ? null : campaign.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem', color: 'var(--bone)' }}>{campaign.creation_name}</h4>
                          {campaign.summary && (
                            <div
                              style={{
                                margin: 0,
                                color: 'var(--muted)',
                                fontSize: '0.9rem',
                                lineHeight: '1.5',
                              }}
                              className="patreon-html-content"
                              dangerouslySetInnerHTML={{ __html: campaign.summary }}
                            />
                          )}
                        </div>
                        <span style={{ color: 'var(--sepia)', fontSize: '0.85rem' }}>
                          {campaign.patron_count} {t('patreon.campaigns.patrons') || 'patrons'}
                        </span>
                      </div>
                      {selectedCampaign === campaign.id && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          {/* Tiers Section */}
                          {tiers[campaign.id] && (
                            <>
                              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sepia)' }}>
                                {t('patreon.tiers.title') || 'Tiers'}
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {tiers[campaign.id].map((tier) => (
                                  <div
                                    key={tier.id}
                                    style={{
                                      background: 'rgba(0, 0, 0, 0.3)',
                                      padding: '0.75rem',
                                      borderRadius: '4px',
                                      border: '1px solid rgba(255, 255, 255, 0.05)',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <strong style={{ color: 'var(--bone)' }}>{tier.title}</strong>
                                        <span style={{ color: 'var(--sepia)', fontSize: '0.85rem' }}>
                                          {formatCurrency(tier.amount_cents)}
                                        </span>
                                        {!tier.published && (
                                          <span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
                                            (Draft)
                                          </span>
                                        )}
                                      </div>
                                      {tier.description && (
                                        <div
                                          style={{
                                            margin: 0,
                                            color: 'var(--muted)',
                                            fontSize: '0.85rem',
                                            lineHeight: '1.5',
                                          }}
                                          className="patreon-html-content"
                                          dangerouslySetInnerHTML={{ __html: tier.description }}
                                        />
                                      )}
                                      <p style={{ margin: '0.25rem 0 0', color: 'var(--muted)', fontSize: '0.75rem' }}>
                                        {tier.patron_count} {t('patreon.campaigns.patrons') || 'patrons'}
                                      </p>
                                    </div>
                                    <button
                                      className="admin-action-btn"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleEditTier(tier)
                                      }}
                                      style={{ marginLeft: '1rem', padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                                    >
                                      {t('patreon.tiers.edit') || 'Edit'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          {/* Members Section */}
                          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <h4 style={{ margin: 0, fontSize: '0.9rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sepia)' }}>
                                {t('patreon.members.title') || 'Members'}
                              </h4>
                              <button
                                className="admin-action-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (showMembersForCampaign === campaign.id) {
                                    setShowMembersForCampaign(null)
                                  } else {
                                    setShowMembersForCampaign(campaign.id)
                                    if (!members[campaign.id]) {
                                      fetchMembersForCampaign(campaign.id, false)
                                    }
                                  }
                                }}
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                              >
                                {showMembersForCampaign === campaign.id
                                  ? t('patreon.members.hide') || 'Hide'
                                  : t('patreon.members.show') || 'Show Members'}
                              </button>
                            </div>
                            {showMembersForCampaign === campaign.id && members[campaign.id] && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                                {members[campaign.id].length === 0 ? (
                                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                                    {t('patreon.members.empty') || 'No members found'}
                                  </p>
                                ) : (
                                  members[campaign.id].map((member) => (
                                    <div
                                      key={member.id}
                                      style={{
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        padding: '0.75rem',
                                        borderRadius: '4px',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                      }}
                                    >
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <div style={{ flex: 1 }}>
                                          <strong style={{ color: 'var(--bone)', display: 'block', marginBottom: '0.25rem' }}>
                                            {member.full_name || t('patreon.members.anonymous') || 'Anonymous'}
                                          </strong>
                                          {member.email && (
                                            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>{member.email}</p>
                                          )}
                                        </div>
                                        <span
                                          style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            background:
                                              member.patron_status === 'active_patron'
                                                ? 'rgba(0, 255, 0, 0.2)'
                                                : member.patron_status === 'former_patron'
                                                ? 'rgba(255, 255, 0, 0.2)'
                                                : 'rgba(128, 128, 128, 0.2)',
                                            color: 'var(--bone)',
                                            textTransform: 'uppercase',
                                          }}
                                        >
                                          {member.patron_status === 'active_patron'
                                            ? t('patreon.members.status.active') || 'Active'
                                            : member.patron_status === 'former_patron'
                                            ? t('patreon.members.status.former') || 'Former'
                                            : member.patron_status}
                                        </span>
                                      </div>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--muted)' }}>
                                        <div>
                                          <strong>{t('patreon.members.currentPledge') || 'Current Pledge'}:</strong>{' '}
                                          {formatCurrency(member.currently_entitled_amount_cents)}
                                        </div>
                                        <div>
                                          <strong>{t('patreon.members.lifetimeSupport') || 'Lifetime Support'}:</strong>{' '}
                                          {formatCurrency(member.lifetime_support_cents)}
                                        </div>
                                        {member.last_charge_date && (
                                          <div>
                                            <strong>{t('patreon.members.lastCharge') || 'Last Charge'}:</strong>{' '}
                                            {new Date(member.last_charge_date).toLocaleDateString()}
                                          </div>
                                        )}
                                        {member.pledge_relationship_start && (
                                          <div>
                                            <strong>{t('patreon.members.memberSince') || 'Member Since'}:</strong>{' '}
                                            {new Date(member.pledge_relationship_start).toLocaleDateString()}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Actions */}
            <div className="admin-main-grid">
              <section className="admin-panel admin-quick-actions">
                <div className="admin-panel-header">
                  <h3>{t('patreon.actions.title') || 'Actions'}</h3>
                </div>
                <div className="admin-actions-grid">
                  <button className="admin-action-btn" onClick={handleRefresh}>
                    <span className="admin-action-icon">↻</span>
                    <span className="admin-action-label">{t('patreon.actions.refresh') || 'Refresh Data'}</span>
                  </button>
                  <button className="admin-action-btn" onClick={handleClearCache}>
                    <span className="admin-action-icon">🗑️</span>
                    <span className="admin-action-label">{t('patreon.actions.clearCache') || 'Clear Cache'}</span>
                  </button>
                  <a
                    className="admin-action-btn"
                    href="https://www.patreon.com/portal/registration/register-clients"
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <span className="admin-action-icon">⚙️</span>
                    <span className="admin-action-label">{t('patreon.actions.manageOAuth') || 'Manage OAuth App'}</span>
                  </a>
                </div>
              </section>

              {/* API Endpoints */}
              <section className="admin-panel">
                <h3>{t('patreon.api.title') || 'API Endpoints'}</h3>
                <ul>
                  <li>
                    <strong>{t('patreon.api.getUser') || 'Get User Info'}</strong>
                    <br />
                    <code style={{ fontSize: '0.8rem', color: 'var(--sepia)' }}>GET /v1/patreon/user</code>
                  </li>
                  <li>
                    <strong>{t('patreon.api.getCampaigns') || 'Get Campaigns'}</strong>
                    <br />
                    <code style={{ fontSize: '0.8rem', color: 'var(--sepia)' }}>GET /v1/patreon/campaigns</code>
                  </li>
                  <li>
                    <strong>{t('patreon.api.getStats') || 'Get Statistics'}</strong>
                    <br />
                    <code style={{ fontSize: '0.8rem', color: 'var(--sepia)' }}>GET /v1/patreon/stats</code>
                  </li>
                  <li>
                    <strong>{t('patreon.api.clearCache') || 'Clear Cache'}</strong>
                    <br />
                    <code style={{ fontSize: '0.8rem', color: 'var(--sepia)' }}>POST /v1/patreon/cache/clear</code>
                  </li>
                  <li>
                    <strong>{t('patreon.api.getTiers') || 'Get Tiers'}</strong>
                    <br />
                    <code style={{ fontSize: '0.8rem', color: 'var(--sepia)' }}>GET /v1/patreon/campaigns/:campaignId/tiers</code>
                  </li>
                  <li>
                    <strong>{t('patreon.api.getMembers') || 'Get Members'}</strong>
                    <br />
                    <code style={{ fontSize: '0.8rem', color: 'var(--sepia)' }}>GET /v1/patreon/campaigns/:campaignId/members</code>
                  </li>
                </ul>
              </section>
            </div>
          </>
        )}

        {/* Tier Edit Modal */}
        {editingTier && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setEditingTier(null)}
          >
            <div
              className="admin-panel"
              style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{t('patreon.tiers.editTitle') || 'Edit Tier'}</h3>
              <TierEditForm tier={editingTier} onSave={handleSaveTier} onCancel={() => setEditingTier(null)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TierEditForm({ tier, onSave, onCancel }: { tier: PatreonTier; onSave: (tier: PatreonTier) => void; onCancel: () => void }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    title: tier.title,
    description: tier.description,
    amount_cents: tier.amount_cents,
    published: tier.published,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...tier, ...formData })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--bone)', fontSize: '0.85rem' }}>
          {t('patreon.tiers.title') || 'Title'}
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            color: 'var(--bone)',
            fontSize: '1rem',
          }}
          required
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--bone)', fontSize: '0.85rem' }}>
          {t('patreon.tiers.description') || 'Description'}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            color: 'var(--bone)',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--bone)', fontSize: '0.85rem' }}>
          {t('patreon.tiers.amount') || 'Amount (cents)'}
        </label>
        <input
          type="number"
          value={formData.amount_cents}
          onChange={(e) => setFormData({ ...formData, amount_cents: parseInt(e.target.value) || 0 })}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            color: 'var(--bone)',
            fontSize: '1rem',
          }}
          required
          min="0"
        />
        <p style={{ margin: '0.25rem 0 0', color: 'var(--muted)', fontSize: '0.75rem' }}>
          ${(formData.amount_cents / 100).toFixed(2)} USD
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bone)', fontSize: '0.85rem' }}>
          <input
            type="checkbox"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            style={{ width: '1.2rem', height: '1.2rem' }}
          />
          {t('patreon.tiers.published') || 'Published'}
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button type="button" className="admin-action-btn" onClick={onCancel}>
          {t('common.cancel') || 'Cancel'}
        </button>
        <button type="submit" className="admin-action-btn">
          {t('common.save') || 'Save'}
        </button>
      </div>
    </form>
  )
}
