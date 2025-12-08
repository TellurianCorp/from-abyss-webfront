import { useTranslation } from 'react-i18next'
import { AdminNavbar } from '../components/AdminNavbar'

export function KoliseumAdmin() {
  const { t } = useTranslation()

  const koliseumQueue = [
    t('koliseum.queue.matchWaiting'),
    t('koliseum.queue.modderSubmission'),
    t('koliseum.queue.latencyAlert'),
  ]

  const koliseumHighlights = [
    t('koliseum.highlights.tournaments'),
    t('koliseum.highlights.artifactVault'),
    t('koliseum.highlights.rituals'),
  ]

  const koliseumEndpoints = [
    { label: t('koliseum.endpoints.listServers'), detail: 'GET /api/servers' },
    { label: t('koliseum.endpoints.serverMetrics'), detail: 'GET /api/servers/:id/metrics' },
    { label: t('koliseum.endpoints.startStopRestart'), detail: 'POST /api/servers/:id/{start,stop,restart}' },
    { label: t('koliseum.endpoints.playerStats'), detail: 'GET /api/stats/players/:server_id/:player_id' },
    { label: t('koliseum.endpoints.leaderboard'), detail: 'GET /api/stats/leaderboard' },
    { label: t('koliseum.endpoints.matchHistory'), detail: 'GET /api/stats/matches' },
  ]

  return (
    <div className="koliseum-page">
      <AdminNavbar />
      <div style={{ paddingTop: '100px' }}>
        <header className="koliseum-hero">
          <div>
            <p className="admin-eyebrow">{t('koliseum.console.eyebrow')}</p>
            <h1>{t('koliseum.console.title')}</h1>
            <p className="admin-lede">{t('koliseum.console.description')}</p>
          </div>
        </header>
      <section className="koliseum-panel">
        <h3>{t('koliseum.console.liveQueue')}</h3>
        <ul>
          {koliseumQueue.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="koliseum-panel">
        <h3>{t('koliseum.console.highlights')}</h3>
        <ul>
          {koliseumHighlights.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <a className="koliseum-btn" href="https://koliseum.example.com/api/docs" target="_blank" rel="noreferrer">
          {t('koliseum.console.openApiAdmin')}
        </a>
      </section>
      <section className="koliseum-panel endpoints">
        <h3>{t('koliseum.console.apiQuickLinks')}</h3>
        <ul>
          {koliseumEndpoints.map((endpoint) => (
            <li key={endpoint.detail}>
              <strong>{endpoint.label}</strong>
              <span>{endpoint.detail}</span>
            </li>
          ))}
        </ul>
        <a className="koliseum-btn" href="http://127.0.0.1:5050/swagger-ui/" target="_blank" rel="noreferrer">
          {t('koliseum.console.swaggerUI')}
        </a>
      </section>
      </div>
    </div>
  )
}
