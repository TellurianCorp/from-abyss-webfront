import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { YouTubeHighlights } from '../components/YouTubeHighlights'
import { FeediverseHorrorFeed } from '../components/FeediverseHorrorFeed'
import { PatreonSimpleCTA } from '../components/PatreonSimpleCTA'

const showBackoffice = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')

export function Landing() {
  const { t } = useTranslation()

  const goals = [
    t('mission.goals.connect'),
    t('mission.goals.illuminate'),
    t('mission.goals.build'),
    t('mission.goals.document'),
  ]

  return (
    <div className="page">
      <Navbar />

      <div className="page-content">
        <div className="grid-columns">
          <div className="column column-left">
            <section className="section tv-section" id="tv">
              <div className="section-header">
                <h2>{t('tv.title')}</h2>
                <p>{t('tv.description')}</p>
              </div>
              <p className="tv-description">{t('tv.fullDescription')}</p>
              <div className="tv-pillars">
                <span>{t('tv.pillars.documentary')}</span>
                <span>{t('tv.pillars.liveStreams')}</span>
                <span>{t('tv.pillars.deepDives')}</span>
                <span>{t('tv.pillars.showcases')}</span>
              </div>
              <a className="tv-cta" href="https://www.youtube.com/@fromabyssmedia" target="_blank" rel="noreferrer">
                {t('tv.visitChannel')}
              </a>
            </section>
            <YouTubeHighlights />
          </div>

          <div className="column column-center">
            <FeediverseHorrorFeed />
          </div>

          <div className="column column-right">
            <section className="section">
              <div className="section-header">
                <h2>{t('mission.title')}</h2>
                <p>{t('mission.description')}</p>
              </div>
              <ol className="goal-list">
                {goals.map((goal, index) => (
                  <li key={index}>{goal}</li>
                ))}
              </ol>
            </section>
            {showBackoffice && (
              <section className="section backoffice">
                <div className="section-header">
                  <h2>{t('backoffice.title')}</h2>
                  <p dangerouslySetInnerHTML={{ __html: t('backoffice.description') }} />
                </div>
                <p className="backoffice-note" dangerouslySetInnerHTML={{ __html: t('backoffice.note') }} />
              </section>
            )}
            <PatreonSimpleCTA />
          </div>
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
