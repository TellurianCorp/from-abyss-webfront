import { useTranslation } from 'react-i18next'
import { AdminNavbar } from '../components/AdminNavbar'
import { PatreonManagement } from '../components/PatreonManagement'
import { YouTubeManagement } from '../components/YouTubeManagement'
import MetricsDashboard from '../components/MetricsDashboard'

export function Admin() {
  const { t } = useTranslation()

  const adminMetrics = [
    { label: t('admin.metrics.activeSessions'), value: '342' },
    { label: t('admin.metrics.signalQueue'), value: '18' },
    { label: t('admin.metrics.federatedMentions'), value: '1,024' },
  ]

  const adminActions = [
    { label: t('admin.actions.runFederationSync'), action: 'federation-sync', icon: '🔄' },
    { label: t('admin.actions.reviewQueuedEssays'), action: 'review-essays', icon: '📝' },
    { label: t('admin.actions.spotlightWatchParty'), action: 'watch-party', icon: '🎬' },
  ]

  const incidentFeed = [
    { text: t('admin.incidentFeed.remoteArtUpload'), status: 'warning', time: '12:41 UTC' },
    { text: t('admin.incidentFeed.atProtocolRelay'), status: 'success', time: '12:10 UTC' },
    { text: t('admin.incidentFeed.qaReport'), status: 'info', time: '11:58 UTC' },
  ]

  const koliseumStats = [
    { label: t('koliseum.stats.playersOnline'), value: '128' },
    { label: t('koliseum.stats.lobbiesActive'), value: '8' },
    { label: t('koliseum.stats.matchApproval'), value: '97%' },
  ]

  const services = [
    {
      id: 'koliseum',
      name: 'Koliseum',
      description: 'Gaming & matchmaking platform',
      status: 'active',
      stats: koliseumStats,
      link: '/koliseum-admin',
      color: 'blood',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Channel management & analytics',
      status: 'active',
      component: 'YouTubeManagement',
      color: 'sepia',
    },
    {
      id: 'patreon',
      name: 'Patreon',
      description: 'Membership & campaign management',
      status: 'active',
      component: 'PatreonManagement',
      color: 'bone',
    },
    {
      id: 'feediverse',
      name: 'Feediverse',
      description: 'Federated horror content feed',
      status: 'active',
      color: 'muted',
    },
  ]

  return (
    <div className="admin-page">
      <AdminNavbar />
      <div style={{ paddingTop: '100px' }}>
      <section className="admin-metrics">
        {adminMetrics.map((metric) => (
          <article key={metric.label} className="admin-metric-card">
            <p className="admin-metric-label">{metric.label}</p>
            <h2>{metric.value}</h2>
          </article>
        ))}
      </section>

      <section className="admin-services-hub">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Services Hub</h2>
          <p className="admin-section-description">Manage all From Abyss Media services and integrations</p>
        </div>
        <div className="admin-services-grid">
          {services.map((service) => {
            if (service.component) {
              // For services with components, render them directly with service card styling
              return (
                <div key={service.id} className={`admin-service-card service-${service.color} service-with-component`}>
                  <div className="admin-service-header">
                    <div>
                      <h3 className="admin-service-name">{service.name}</h3>
                      <p className="admin-service-description">{service.description}</p>
                    </div>
                    <span className={`admin-service-status status-${service.status}`}>
                      {service.status === 'active' ? '●' : '○'}
                    </span>
                  </div>
                  {service.component === 'YouTubeManagement' && <YouTubeManagement />}
                  {service.component === 'PatreonManagement' && <PatreonManagement />}
                </div>
              )
            }
            // For services without components, render full service card
            return (
              <div key={service.id} className={`admin-service-card service-${service.color}`}>
                <div className="admin-service-header">
                  <div>
                    <h3 className="admin-service-name">{service.name}</h3>
                    <p className="admin-service-description">{service.description}</p>
                  </div>
                  <span className={`admin-service-status status-${service.status}`}>
                    {service.status === 'active' ? '●' : '○'}
                  </span>
                </div>
                {service.stats && (
                  <div className="admin-service-stats">
                    {service.stats.map((stat) => (
                      <div key={stat.label} className="admin-service-stat">
                        <span className="admin-service-stat-label">{stat.label}</span>
                        <strong className="admin-service-stat-value">{stat.value}</strong>
                      </div>
                    ))}
                  </div>
                )}
                {service.link && (
                  <a
                    className={`admin-service-link service-link-${service.color}`}
                    href={service.link}
                    target={service.link.startsWith('http') ? '_blank' : undefined}
                    rel={service.link.startsWith('http') ? 'noreferrer' : undefined}
                  >
                    {service.id === 'koliseum' ? t('koliseum.admin.openComprehensiveConsole') : `Open ${service.name}`}
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <div className="admin-main-grid">
        <section className="admin-panel admin-quick-actions">
          <div className="admin-panel-header">
            <h3>{t('admin.actions.title')}</h3>
          </div>
          <div className="admin-actions-grid">
            {adminActions.map((action, index) => (
              <button
                key={index}
                className={`admin-action-btn action-${action.action}`}
                onClick={() => {
                  // Placeholder for action handlers
                  console.log(`Action: ${action.action}`)
                }}
              >
                <span className="admin-action-icon">{action.icon}</span>
                <span className="admin-action-label">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="admin-panel admin-incident-feed">
          <div className="admin-panel-header">
            <h3>{t('admin.incidentFeed.title')}</h3>
          </div>
          <div className="admin-incident-list">
            {incidentFeed.map((incident, index) => (
              <div key={index} className={`admin-incident-item incident-${incident.status}`}>
                <span className="admin-incident-status-icon">
                  {incident.status === 'success' ? '✓' : incident.status === 'warning' ? '⚠' : 'ℹ'}
                </span>
                <div className="admin-incident-content">
                  <p className="admin-incident-text">{incident.text}</p>
                  <span className="admin-incident-time">{incident.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      </div>

      <section className="metrics-section">
        <h2>{t('metrics.sync.title')}</h2>
        <MetricsDashboard />
      </section>
    </div>
  )
}
