import { useEffect } from 'react'
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

  // Add structured data for SEO
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'From Abyss Media - Horror Social Network',
      description: t('tv.description'),
      url: 'https://fromabyss.com/',
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: t('tv.title'),
            url: 'https://fromabyss.com/#tv'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: t('mission.title'),
            url: 'https://fromabyss.com/#mission'
          }
        ]
      }
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'landing-page-structured-data'
    script.textContent = JSON.stringify(structuredData)
    document.head.appendChild(script)

    return () => {
      const existing = document.getElementById('landing-page-structured-data')
      if (existing) existing.remove()
    }
  }, [t])

  return (
    <div className="page">
      <Navbar />

      <main className="page-content" role="main">
        <div className="grid-columns">
          <div className="column column-left">
            <article className="section tv-section" id="tv" itemScope itemType="https://schema.org/VideoObject">
              <div className="section-header">
                <h2 itemProp="name">{t('tv.title')}</h2>
                <p itemProp="description">{t('tv.description')}</p>
              </div>
              <p className="tv-description">{t('tv.fullDescription')}</p>
              <div className="tv-pillars" role="list">
                <span role="listitem">{t('tv.pillars.documentary')}</span>
                <span role="listitem">{t('tv.pillars.liveStreams')}</span>
                <span role="listitem">{t('tv.pillars.deepDives')}</span>
                <span role="listitem">{t('tv.pillars.showcases')}</span>
              </div>
              <a 
                className="tv-cta" 
                href="https://www.youtube.com/@fromabyssmedia" 
                target="_blank" 
                rel="noreferrer noopener"
                itemProp="url"
                aria-label={`${t('tv.visitChannel')} - From Abyss Media YouTube Channel`}
              >
                {t('tv.visitChannel')}
              </a>
            </article>
            <YouTubeHighlights />
          </div>

          <div className="column column-center">
            <FeediverseHorrorFeed />
          </div>

          <div className="column column-right">
            <section className="section" id="mission" itemScope itemType="https://schema.org/AboutPage">
              <div className="section-header">
                <h2 itemProp="name">{t('mission.title')}</h2>
                <p itemProp="description">{t('mission.description')}</p>
              </div>
              <ol className="goal-list" role="list">
                {goals.map((goal, index) => (
                  <li key={index} role="listitem" itemProp="about">{goal}</li>
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
      </main>
      <footer className="footer" role="contentinfo" itemScope itemType="https://schema.org/WPFooter">
        <img className="footer-logo" src="/imgs/tellurian_white.png" alt="Tellurian" itemProp="logo" />
        <nav className="footer-links" aria-label="Footer navigation">
          <Link to="/about" className="footer-link" itemProp="url">{t('footer.aboutUs')}</Link>
          <span className="footer-separator" aria-hidden="true">|</span>
          <Link to="/editorial" className="footer-link" itemProp="url">{t('footer.focusEditorial')}</Link>
          <span className="footer-separator" aria-hidden="true">|</span>
          <Link to="/contact" className="footer-link" itemProp="url">{t('footer.contactUs')}</Link>
          <span className="footer-separator" aria-hidden="true">|</span>
          <Link to="/patreon" className="footer-link" itemProp="url">{t('footer.supportUs', 'Support Us')}</Link>
        </nav>
        <div className="footer-text-container">
          <p className="footer-text" itemProp="copyrightHolder">{t('common.madeBy')}</p>
          <p className="footer-text" itemProp="copyrightYear">{t('common.allRightsReserved')}</p>
        </div>
      </footer>
    </div>
  )
}
