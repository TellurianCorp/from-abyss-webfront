import { useTranslation } from 'react-i18next'
import { AdminNavbar } from '../components/AdminNavbar'
import { PatreonManagement } from '../components/PatreonManagement'
import { YouTubeManagement } from '../components/YouTubeManagement'
import MetricsDashboard from '../components/MetricsDashboard'
import styles from '../styles/Admin.module.css'

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

  const getServiceColorClass = (color: string) => {
    switch (color) {
      case 'blood': return styles.serviceBlood
      case 'sepia': return styles.serviceSepia
      case 'bone': return styles.serviceBone
      case 'muted': return styles.serviceMuted
      default: return ''
    }
  }

  const getIncidentStatusClass = (status: string) => {
    switch (status) {
      case 'success': return styles.incidentSuccess
      case 'warning': return styles.incidentWarning
      case 'info': return styles.incidentInfo
      default: return ''
    }
  }

  return (
    <div className={styles.adminPage}>
      <AdminNavbar />
      <div style={{ paddingTop: '100px' }}>
      <section className={styles.adminMetrics}>
        {adminMetrics.map((metric) => (
          <article key={metric.label} className={styles.adminMetricCard}>
            <p className={styles.adminMetricLabel}>{metric.label}</p>
            <h2>{metric.value}</h2>
          </article>
        ))}
      </section>

      <section className={styles.adminServicesHub}>
        <div className={styles.adminSectionHeader}>
          <h2 className={styles.adminSectionTitle}>Services Hub</h2>
          <p className={styles.adminSectionDescription}>Manage all From Abyss Media services and integrations</p>
        </div>
        <div className={styles.adminServicesGrid}>
          {services.map((service) => {
            if (service.component) {
              // For services with components, render them directly with service card styling
              return (
                <div key={service.id} className={`${styles.adminServiceCard} ${getServiceColorClass(service.color)} ${styles.serviceWithComponent}`}>
                  <div className={styles.adminServiceHeader}>
                    <div>
                      <h3 className={styles.adminServiceName}>{service.name}</h3>
                      <p className={styles.adminServiceDescription}>{service.description}</p>
                    </div>
                    <span className={`${styles.adminServiceStatus} ${service.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
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
              <div key={service.id} className={`${styles.adminServiceCard} ${getServiceColorClass(service.color)}`}>
                <div className={styles.adminServiceHeader}>
                  <div>
                    <h3 className={styles.adminServiceName}>{service.name}</h3>
                    <p className={styles.adminServiceDescription}>{service.description}</p>
                  </div>
                  <span className={`${styles.adminServiceStatus} ${service.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                    {service.status === 'active' ? '●' : '○'}
                  </span>
                </div>
                {service.stats && (
                  <div className={styles.adminServiceStats}>
                    {service.stats.map((stat) => (
                      <div key={stat.label} className={styles.adminServiceStat}>
                        <span className={styles.adminServiceStatLabel}>{stat.label}</span>
                        <strong className={styles.adminServiceStatValue}>{stat.value}</strong>
                      </div>
                    ))}
                  </div>
                )}
                {service.link && (
                  <a
                    className={styles.adminServiceLink}
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

      <div className={styles.adminMainGrid}>
        <section className={`${styles.adminPanel} ${styles.adminQuickActions}`}>
          <div className={styles.adminPanelHeader}>
            <h3>{t('admin.actions.title')}</h3>
          </div>
          <div className={styles.adminActionsGrid}>
            {adminActions.map((action, index) => (
              <button
                key={index}
                className={styles.adminActionBtn}
                onClick={() => {
                  // Placeholder for action handlers
                  console.log(`Action: ${action.action}`)
                }}
              >
                <span className={styles.adminActionIcon}>{action.icon}</span>
                <span className={styles.adminActionLabel}>{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={`${styles.adminPanel} ${styles.adminIncidentFeed}`}>
          <div className={styles.adminPanelHeader}>
            <h3>{t('admin.incidentFeed.title')}</h3>
          </div>
          <div className={styles.adminIncidentList}>
            {incidentFeed.map((incident, index) => (
              <div key={index} className={`${styles.adminIncidentItem} ${getIncidentStatusClass(incident.status)}`}>
                <span className={styles.adminIncidentStatusIcon}>
                  {incident.status === 'success' ? '✓' : incident.status === 'warning' ? '⚠' : 'ℹ'}
                </span>
                <div className={styles.adminIncidentContent}>
                  <p className={styles.adminIncidentText}>{incident.text}</p>
                  <span className={styles.adminIncidentTime}>{incident.time}</span>
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
