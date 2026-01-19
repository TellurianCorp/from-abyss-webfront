import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AdminNavbar } from '../components/AdminNavbar'
import { FeediverseManagement } from '../components/FeediverseManagement'
import { PatreonManagement } from '../components/PatreonManagement'
import { YouTubeManagement } from '../components/YouTubeManagement'
import MetricsDashboard from '../components/MetricsDashboard'
import ActivityPubMonitor from '../components/ActivityPubMonitor'
import { apiUrl, API_ENDPOINTS } from '../utils/api'
import styles from '../styles/Admin.module.css'

export function Admin() {
  const { t } = useTranslation()

  const adminMetrics = useMemo(() => [
    { label: t('admin.metrics.activeSessions'), value: '342', trend: '+12%' },
    { label: t('admin.metrics.signalQueue'), value: '18', trend: '-5%' },
    { label: t('admin.metrics.federatedMentions'), value: '1,024', trend: '+8%' },
  ], [t])

  const adminActions = useMemo(() => [
    { label: t('admin.actions.runFederationSync'), action: 'federation-sync', icon: '🔄', color: 'primary' },
    { label: t('admin.actions.reviewQueuedEssays'), action: 'review-essays', icon: '📝', color: 'secondary' },
    { label: t('admin.actions.spotlightWatchParty'), action: 'watch-party', icon: '🎬', color: 'accent' },
  ], [t])

  const incidentFeed = useMemo(() => [
    { text: t('admin.incidentFeed.remoteArtUpload'), status: 'warning', time: '12:41 UTC', priority: 'medium' },
    { text: t('admin.incidentFeed.atProtocolRelay'), status: 'success', time: '12:10 UTC', priority: 'low' },
    { text: t('admin.incidentFeed.qaReport'), status: 'info', time: '11:58 UTC', priority: 'low' },
  ], [t])

  const koliseumStats = useMemo(() => [
    { label: t('koliseum.stats.playersOnline'), value: '128' },
    { label: t('koliseum.stats.lobbiesActive'), value: '8' },
    { label: t('koliseum.stats.matchApproval'), value: '97%' },
  ], [t])

  const services = useMemo(() => [
    {
      id: 'koliseum',
      name: t('admin.services.koliseum.name'),
      description: t('admin.services.koliseum.description'),
      status: 'active',
      stats: koliseumStats,
      link: '/koliseum-admin',
      color: 'blood',
      icon: '⚔️',
    },
    {
      id: 'youtube',
      name: t('admin.services.youtube.name'),
      description: t('admin.services.youtube.description'),
      status: 'active',
      component: 'YouTubeManagement',
      color: 'sepia',
      icon: '📺',
    },
    {
      id: 'patreon',
      name: t('admin.services.patreon.name'),
      description: t('admin.services.patreon.description'),
      status: 'active',
      component: 'PatreonManagement',
      color: 'bone',
      icon: '💎',
    },
    {
      id: 'feediverse',
      name: t('admin.services.feediverse.name'),
      description: t('admin.services.feediverse.description'),
      status: 'active',
      color: 'muted',
      component: 'FeediverseManagement',
      icon: '🌐',
    },
    {
      id: 'users',
      name: t('admin.services.users.name'),
      description: t('admin.services.users.description'),
      status: 'active',
      link: '/admin/users',
      color: 'blood',
      icon: '👥',
    },
  ], [koliseumStats, t])

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

  const handleAction = async (action: string) => {
    console.log(`Action: ${action}`)
    
    if (action === 'federation-sync') {
      try {
        const response = await fetch(apiUrl(API_ENDPOINTS.activitypub.sync), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Federation sync completed:', data)
          alert(`Federation sync completed!\n\nTasks: ${data.tasks?.length || 0}\nPending follow requests: ${data.pending_follow_requests || 0}\nLocal actors: ${data.local_actors || 0}`)
        } else {
          const error = await response.json().catch(() => ({ message: 'Unknown error' }))
          console.error('Federation sync failed:', error)
          alert(`Federation sync failed: ${error.message || 'Unknown error'}`)
        }
      } catch (error: any) {
        console.error('Error running federation sync:', error)
        alert(`Error running federation sync: ${error.message || 'Unknown error'}`)
      }
    } else {
      // Other actions can be implemented here
      console.log(`Action ${action} not yet implemented`)
    }
  }

  return (
    <div className={styles.adminPage}>
      <AdminNavbar />
      
      <div className={styles.adminContainer}>
        {/* Hero Section */}
        <section className={styles.adminHero}>
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>{t('admin.eyebrow') || 'From Abyss Control'}</p>
            <h1 className={styles.heroTitle}>{t('admin.title') || 'Guardian Dashboard'}</h1>
            <p className={styles.heroDescription}>
              {t('admin.hero.description')}
            </p>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>4</span>
              <span className={styles.heroStatLabel}>{t('admin.hero.activeServices')}</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>99.8%</span>
              <span className={styles.heroStatLabel}>{t('admin.hero.uptime')}</span>
            </div>
          </div>
        </section>

        {/* ActivityPub Monitor */}
        <ActivityPubMonitor />

        {/* Key Metrics */}
        <section className={styles.metricsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('admin.sections.systemOverview.title')}</h2>
            <p className={styles.sectionDescription}>{t('admin.sections.systemOverview.description')}</p>
          </div>
          <div className={styles.metricsGrid}>
            {adminMetrics.map((metric) => (
              <div key={metric.label} className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <p className={styles.metricLabel}>{metric.label}</p>
                  {metric.trend && (
                    <span className={styles.metricTrend}>
                      {metric.trend}
                    </span>
                  )}
                </div>
                <h3 className={styles.metricValue}>{metric.value}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Services Hub */}
        <section className={styles.servicesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('admin.sections.servicesHub.title')}</h2>
            <p className={styles.sectionDescription}>{t('admin.sections.servicesHub.description')}</p>
          </div>
          <div className={styles.servicesGrid}>
            {services.map((service) => {
              if (service.component) {
                return (
                  <div key={service.id} className={`${styles.serviceCard} ${getServiceColorClass(service.color)} ${styles.serviceWithComponent}`}>
                    <div className={styles.serviceCardHeader}>
                      <div className={styles.serviceCardTitle}>
                        <span className={styles.serviceIcon}>{service.icon}</span>
                        <div>
                          <h3 className={styles.serviceName}>{service.name}</h3>
                          <p className={styles.serviceDescription}>{service.description}</p>
                        </div>
                      </div>
                      <span className={`${styles.serviceStatus} ${service.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                        {service.status === 'active' ? '●' : '○'}
                      </span>
                    </div>
                    <div className={styles.serviceContent}>
                      {service.component === 'YouTubeManagement' && <YouTubeManagement />}
                      {service.component === 'PatreonManagement' && <PatreonManagement />}
                      {service.component === 'FeediverseManagement' && <FeediverseManagement />}
                    </div>
                  </div>
                )
              }
              return (
                <div key={service.id} className={`${styles.serviceCard} ${getServiceColorClass(service.color)}`}>
                  <div className={styles.serviceCardHeader}>
                    <div className={styles.serviceCardTitle}>
                      <span className={styles.serviceIcon}>{service.icon}</span>
                      <div>
                        <h3 className={styles.serviceName}>{service.name}</h3>
                        <p className={styles.serviceDescription}>{service.description}</p>
                      </div>
                    </div>
                    <span className={`${styles.serviceStatus} ${service.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                      {service.status === 'active' ? '●' : '○'}
                    </span>
                  </div>
                  {service.stats && (
                    <div className={styles.serviceStats}>
                      {service.stats.map((stat) => (
                        <div key={stat.label} className={styles.serviceStat}>
                          <span className={styles.serviceStatLabel}>{stat.label}</span>
                          <strong className={styles.serviceStatValue}>{stat.value}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                  {service.link && (
                    <Link to={service.link} className={styles.serviceLink}>
                      {service.id === 'koliseum' ? t('koliseum.admin.openComprehensiveConsole') : t('admin.services.openService', { name: service.name })}
                      <span className={styles.serviceLinkArrow}>→</span>
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className={styles.mainGrid}>
          {/* Quick Actions */}
          <section className={styles.actionsPanel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>{t('admin.actions.title')}</h3>
              <p className={styles.panelSubtitle}>{t('admin.actions.subtitle')}</p>
            </div>
            <div className={styles.actionsGrid}>
              {adminActions.map((action, index) => (
                <button
                  key={index}
                  className={`${styles.actionButton} ${styles[`action${action.color.charAt(0).toUpperCase() + action.color.slice(1)}`]}`}
                  onClick={() => handleAction(action.action)}
                >
                  <span className={styles.actionIcon}>{action.icon}</span>
                  <span className={styles.actionLabel}>{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Incident Feed */}
          <section className={styles.incidentsPanel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>{t('admin.incidentFeed.title')}</h3>
              <p className={styles.panelSubtitle}>{t('admin.incidentFeed.subtitle')}</p>
            </div>
            <div className={styles.incidentsList}>
              {incidentFeed.map((incident, index) => (
                <div key={index} className={`${styles.incidentItem} ${getIncidentStatusClass(incident.status)}`}>
                  <span className={styles.incidentIcon}>
                    {incident.status === 'success' ? '✓' : incident.status === 'warning' ? '⚠' : 'ℹ'}
                  </span>
                  <div className={styles.incidentContent}>
                    <p className={styles.incidentText}>{incident.text}</p>
                    <span className={styles.incidentTime}>{incident.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Metrics Dashboard */}
        <section className={styles.metricsDashboardSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('admin.sections.systemMetrics.title')}</h2>
            <p className={styles.sectionDescription}>{t('admin.sections.systemMetrics.description')}</p>
          </div>
          <div className={styles.metricsDashboardContainer}>
            <MetricsDashboard />
          </div>
        </section>
      </div>
    </div>
  )
}
