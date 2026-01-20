import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import './Patreon.css'
import { useSEO } from '../hooks/useSEO'

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

interface PatreonStats {
  total_patrons: number
  total_campaigns: number
}

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

const API_BASE = '/v1/patreon'

export function Patreon() {
  const { t } = useTranslation()

  useSEO({
    title: t('seo.patreon.title'),
    description: t('seo.patreon.description'),
    image: 'https://fromabyss.com/imgs/cover.png',
    url: 'https://fromabyss.com/patreon',
    type: 'website',
    siteName: 'From Abyss Media',
  })
  const [stats, setStats] = useState<PatreonStats | null>(null)
  const [campaigns, setCampaigns] = useState<PatreonCampaign[]>([])
  const [tiers, setTiers] = useState<Record<string, PatreonTier[]>>({})
  const [loading, setLoading] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingTiers, setLoadingTiers] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPatreonData = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      setLoadingStats(true)
      setLoadingTiers(true)
      
      // Fetch stats
      try {
        const statsResponse = await fetch(`${API_BASE}/stats`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats({
            total_campaigns: statsData.total_campaigns || 0,
            total_patrons: statsData.total_patrons || 0,
          })
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoadingStats(false)
      }

      // Fetch campaigns
      try {
        const campaignsResponse = await fetch(`${API_BASE}/campaigns`)
        if (campaignsResponse.ok) {
          const campaignsData = await campaignsResponse.json()
          if (campaignsData.data) {
            const campaignsList = (campaignsData.data as PatreonAPICampaign[]).map((campaign) => ({
              id: campaign.id,
              creation_name: campaign.attributes?.creation_name || '',
              summary: campaign.attributes?.summary || '',
              patron_count: campaign.attributes?.patron_count || 0,
            }))
            setCampaigns(campaignsList)

            // Fetch tiers for all campaigns
            if (campaignsList.length > 0) {
              const tiersPromises = campaignsList.map(async (campaign) => {
                try {
                  const tiersResponse = await fetch(`${API_BASE}/campaigns/${campaign.id}/tiers`)
                  if (tiersResponse.ok) {
                    const tiersData = await tiersResponse.json()
                    if (tiersData.data) {
                      const tiersList = (tiersData.data as PatreonAPITier[])
                        .map((tier) => ({
                          id: tier.id,
                          title: tier.attributes?.title || '',
                          description: tier.attributes?.description || '',
                          amount_cents: tier.attributes?.amount_cents || 0,
                          patron_count: tier.attributes?.patron_count || 0,
                          published: tier.attributes?.published || false,
                          campaign_id: campaign.id,
                        }))
                        .filter((tier: PatreonTier) => tier.published)
                        .sort((a: PatreonTier, b: PatreonTier) => a.amount_cents - b.amount_cents)
                      return { campaignId: campaign.id, tiers: tiersList }
                    }
                  }
                } catch (err) {
                  console.error(`Error fetching tiers for campaign ${campaign.id}:`, err)
                }
                return { campaignId: campaign.id, tiers: [] }
              })

              const tiersResults = await Promise.all(tiersPromises)
              const tiersMap: Record<string, PatreonTier[]> = {}
              tiersResults.forEach(({ campaignId, tiers }) => {
                tiersMap[campaignId] = tiers
              })
              setTiers(tiersMap)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err)
      } finally {
        setLoadingTiers(false)
      }
    } catch (err) {
      console.error('Error fetching Patreon data:', err)
      setError(t('patreon.error.fetchFailed', 'Failed to load Patreon information'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchPatreonData()
  }, [fetchPatreonData])

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  const getPatreonUrl = () => {
    if (campaigns.length > 0) {
      const campaignName = campaigns[0].creation_name.toLowerCase().replace(/\s+/g, '')
      return `https://www.patreon.com/${campaignName}`
    }
    return 'https://www.patreon.com/fromabyssmedia'
  }

  const firstCampaignId = campaigns.length > 0 ? campaigns[0].id : null
  const availableTiers = firstCampaignId ? tiers[firstCampaignId] || [] : []

  return (
    <div className="page">
      <Navbar />
      
      <div className="page-content">
        <div className="patreon-page">
          <section className="section patreon-hero-section">
            <div className="section-header">
              <h1>{t('patreon.page.title', 'Join The Cult')}</h1>
              <p>{t('patreon.page.subtitle', 'Support From Abyss Media and help us build the future of horror media.')}</p>
            </div>
            
            {error && (
              <div className="patreon-error">
                <div className="patreon-error-content">
                  <p>{error}</p>
                  <button 
                    className="patreon-retry-button"
                    onClick={fetchPatreonData}
                    aria-label={t('patreon.retry', 'Retry')}
                  >
                    {t('patreon.retry', 'Retry')}
                  </button>
                </div>
              </div>
            )}

            {!error && (
              <>
                {campaigns.length > 0 && campaigns[0].summary && (
                  <div 
                    className={`patreon-campaign-summary patreon-html-content ${loading ? 'patreon-fade-in' : ''}`}
                    dangerouslySetInnerHTML={{ __html: campaigns[0].summary }}
                  />
                )}
                
                {loadingStats ? (
                  <div className="patreon-stats-large patreon-skeleton">
                    <div className="patreon-stat-large">
                      <div className="patreon-skeleton-value"></div>
                      <div className="patreon-skeleton-label"></div>
                    </div>
                  </div>
                ) : stats && (
                  <div className="patreon-stats-large patreon-fade-in">
                    <div className="patreon-stat-large">
                      <span className="patreon-stat-value-large">{stats.total_patrons}</span>
                      <span className="patreon-stat-label-large">{t('patreon.cta.patrons', 'Patrons')}</span>
                    </div>
                  </div>
                )}

                {loadingTiers ? (
                  <div className="patreon-tiers-detailed">
                    <h2 className="patreon-tiers-title-detailed">
                      {t('patreon.page.tiers.title', 'Membership Tiers')}
                    </h2>
                    <div className="patreon-tiers-grid">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="patreon-tier-card patreon-skeleton-card">
                          <div className="patreon-tier-card-header">
                            <div className="patreon-skeleton-text patreon-skeleton-title"></div>
                            <div className="patreon-skeleton-text patreon-skeleton-price"></div>
                          </div>
                          <div className="patreon-skeleton-text patreon-skeleton-description"></div>
                          <div className="patreon-skeleton-text patreon-skeleton-description"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : availableTiers.length > 0 && (
                  <div className="patreon-tiers-detailed patreon-fade-in">
                    <h2 className="patreon-tiers-title-detailed">
                      {t('patreon.page.tiers.title', 'Membership Tiers')}
                    </h2>
                    <div className="patreon-tiers-grid">
                      {availableTiers.map((tier, index) => (
                        <div 
                          key={tier.id} 
                          className="patreon-tier-card"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="patreon-tier-card-header">
                            <h3 className="patreon-tier-card-name">{tier.title}</h3>
                            <div className="patreon-tier-card-price">{formatCurrency(tier.amount_cents)}</div>
                          </div>
                          {tier.description && (
                            <div 
                              className="patreon-tier-card-description patreon-html-content"
                              dangerouslySetInnerHTML={{ __html: tier.description }}
                            />
                          )}
                          {tier.patron_count > 0 && (
                            <div className="patreon-tier-card-count">
                              {tier.patron_count} {t('patreon.cta.tiers.patrons', 'patrons')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!loading && (
                  <div className="patreon-cta-final patreon-fade-in">
                    <a
                      className="patreon-cta-button-large"
                      href={getPatreonUrl()}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t('patreon.cta.button', 'Become a Patron')}
                    >
                      <i className="fab fa-patreon" aria-hidden="true"></i>
                      {t('patreon.cta.button', 'Become a Patron')}
                    </a>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      <footer className="footer">
        <img className="footer-logo" src="/imgs/tellurian_white.png" alt="Tellurian" />
        <div className="footer-links">
          <Link to="/about" className="footer-link">{t('footer.aboutUs')}</Link>
          <span className="footer-separator">|</span>
          <Link to="/editorial" className="footer-link">{t('footer.focusEditorial')}</Link>
          <span className="footer-separator">|</span>
          <Link to="/contact" className="footer-link">{t('footer.contactUs')}</Link>
          <span className="footer-separator">|</span>
          <Link to="/patreon" className="footer-link">{t('footer.supportUs', 'Support Us')}</Link>
        </div>
        <div className="footer-text-container">
          <p className="footer-text">{t('common.madeBy')}</p>
          <p className="footer-text">{t('common.allRightsReserved')}</p>
        </div>
      </footer>
    </div>
  )
}
