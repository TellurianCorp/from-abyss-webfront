import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './PatreonCallToAction.css'

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

export function PatreonCallToAction() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<PatreonStats | null>(null)
  const [campaigns, setCampaigns] = useState<PatreonCampaign[]>([])
  const [tiers, setTiers] = useState<Record<string, PatreonTier[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatreonData = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch(`${API_BASE}/stats`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats({
            total_campaigns: statsData.total_campaigns || 0,
            total_patrons: statsData.total_patrons || 0,
          })
        }

        // Fetch campaigns
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

            // Fetch tiers for the first campaign (or all if needed)
            if (campaignsList.length > 0) {
              const firstCampaign = campaignsList[0]
              const tiersResponse = await fetch(`${API_BASE}/campaigns/${firstCampaign.id}/tiers`)
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
                      campaign_id: firstCampaign.id,
                    }))
                    .filter((tier: PatreonTier) => tier.published) // Only show published tiers
                    .sort((a: PatreonTier, b: PatreonTier) => a.amount_cents - b.amount_cents) // Sort by price
                  setTiers({ [firstCampaign.id]: tiersList })
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching Patreon data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPatreonData()
  }, [])

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  const getPatreonUrl = () => {
    if (campaigns.length > 0) {
      // Try to construct URL from campaign name
      const campaignName = campaigns[0].creation_name.toLowerCase().replace(/\s+/g, '')
      return `https://www.patreon.com/${campaignName}`
    }
    return 'https://www.patreon.com/fromabyssmedia'
  }

  const firstCampaignId = campaigns.length > 0 ? campaigns[0].id : null
  const availableTiers = firstCampaignId ? tiers[firstCampaignId] || [] : []

  return (
    <section className="section patreon-cta-section">
      <div className="section-header">
        <h2>{t('patreon.cta.title', 'Support the Cult')}</h2>
        <p>{t('patreon.cta.description', 'Join our community of patrons and help us build the future of horror media.')}</p>
      </div>
      
      <div className="patreon-cta-content">
        <div className="patreon-cta-main">
          {campaigns.length > 0 && campaigns[0].summary && (
            <div 
              className="patreon-cta-text patreon-html-content"
              dangerouslySetInnerHTML={{ __html: campaigns[0].summary }}
            />
          )}
          
          {!campaigns[0]?.summary && (
            <p className="patreon-cta-text">
              {t('patreon.cta.message', 'Become a patron and get exclusive access to behind-the-scenes content, early releases, and help shape the direction of From Abyss Media.')}
            </p>
          )}
          
          {!loading && stats && (
            <div className="patreon-stats">
              <div className="patreon-stat">
                <span className="patreon-stat-value">{stats.total_patrons}</span>
                <span className="patreon-stat-label">{t('patreon.cta.patrons', 'Patrons')}</span>
              </div>
            </div>
          )}

          {availableTiers.length > 0 && (
            <div className="patreon-tiers">
              <h3 className="patreon-tiers-title">{t('patreon.cta.tiers.title', 'Membership Tiers')}</h3>
              <div className="patreon-tiers-list">
                {availableTiers.slice(0, 3).map((tier) => (
                  <div key={tier.id} className="patreon-tier-item">
                    <div className="patreon-tier-header">
                      <h4 className="patreon-tier-name">{tier.title}</h4>
                      <span className="patreon-tier-price">{formatCurrency(tier.amount_cents)}</span>
                    </div>
                    {tier.description && (
                      <div 
                        className="patreon-tier-description patreon-html-content"
                        dangerouslySetInnerHTML={{ __html: tier.description }}
                      />
                    )}
                    {tier.patron_count > 0 && (
                      <p className="patreon-tier-count">
                        {tier.patron_count} {t('patreon.cta.tiers.patrons', 'patrons')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <a
            className="patreon-cta-button"
            href={getPatreonUrl()}
            target="_blank"
            rel="noreferrer"
          >
            <i className="fab fa-patreon" aria-hidden="true"></i>
            {t('patreon.cta.button', 'Become a Patron')}
          </a>
        </div>
      </div>
    </section>
  )
}
