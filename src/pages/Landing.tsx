import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { YouTubeHighlights } from '../components/YouTubeHighlights'
import { FeediverseHorrorFeed } from '../components/FeediverseHorrorFeed'
import { PatreonSimpleCTA } from '../components/PatreonSimpleCTA'
import pageStyles from '../styles/Page.module.css'
import cardStyles from '../styles/Cards.module.css'
import footerStyles from '../styles/Footer.module.css'

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
    <div className={pageStyles.page}>
      <Navbar />

      <main className={pageStyles.pageContent} role="main">
        <div className={pageStyles.gridColumns}>
          <div className={pageStyles.column}>
            <article className={`${cardStyles.section} ${cardStyles.tvSection}`} id="tv" itemScope itemType="https://schema.org/VideoObject">
              <div className={cardStyles.sectionHeader}>
                <h2 itemProp="name">{t('tv.title')}</h2>
                <p itemProp="description">{t('tv.description')}</p>
              </div>
              <p className={cardStyles.tvDescription}>{t('tv.fullDescription')}</p>
              <div className={cardStyles.tvPillars} role="list">
                <span role="listitem">{t('tv.pillars.documentary')}</span>
                <span role="listitem">{t('tv.pillars.liveStreams')}</span>
                <span role="listitem">{t('tv.pillars.deepDives')}</span>
                <span role="listitem">{t('tv.pillars.showcases')}</span>
              </div>
              <a 
                className={cardStyles.tvCta} 
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

          <div className={pageStyles.column}>
            <FeediverseHorrorFeed />
          </div>

          <div className={pageStyles.column}>
            <section className={cardStyles.section} id="mission" itemScope itemType="https://schema.org/AboutPage">
              <div className={cardStyles.sectionHeader}>
                <h2 itemProp="name">{t('mission.title')}</h2>
                <p itemProp="description">{t('mission.description')}</p>
              </div>
              <ol className={cardStyles.goalList} role="list">
                {goals.map((goal, index) => (
                  <li key={index} role="listitem" itemProp="about">{goal}</li>
                ))}
              </ol>
            </section>
            {showBackoffice && (
              <section className={`${cardStyles.section} ${cardStyles.backoffice}`}>
                <div className={cardStyles.sectionHeader}>
                  <h2>{t('backoffice.title')}</h2>
                  <p dangerouslySetInnerHTML={{ __html: t('backoffice.description') }} />
                </div>
                <p className={cardStyles.backofficeNote} dangerouslySetInnerHTML={{ __html: t('backoffice.note') }} />
              </section>
            )}
            <PatreonSimpleCTA />
          </div>
        </div>
      </main>
      <footer className={footerStyles.footer} role="contentinfo" itemScope itemType="https://schema.org/WPFooter">
        <img className={footerStyles.footerLogo} src="/imgs/tellurian_white.png" alt="Tellurian" itemProp="logo" />
        <nav className={footerStyles.footerLinks} aria-label="Footer navigation">
          <Link to="/about" className={footerStyles.footerLink} itemProp="url">{t('footer.aboutUs')}</Link>
          <span className={footerStyles.footerSeparator} aria-hidden="true">|</span>
          <Link to="/editorial" className={footerStyles.footerLink} itemProp="url">{t('footer.focusEditorial')}</Link>
          <span className={footerStyles.footerSeparator} aria-hidden="true">|</span>
          <Link to="/contact" className={footerStyles.footerLink} itemProp="url">{t('footer.contactUs')}</Link>
          <span className={footerStyles.footerSeparator} aria-hidden="true">|</span>
          <Link to="/patreon" className={footerStyles.footerLink} itemProp="url">{t('footer.supportUs', 'Support Us')}</Link>
        </nav>
        <div className={footerStyles.footerTextContainer}>
          <p className={footerStyles.footerText} itemProp="copyrightHolder">{t('common.madeBy')}</p>
          <p className={footerStyles.footerText} itemProp="copyrightYear">{t('common.allRightsReserved')}</p>
        </div>
      </footer>
    </div>
  )
}
