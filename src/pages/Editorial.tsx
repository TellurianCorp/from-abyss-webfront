import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import pageStyles from '../styles/Page.module.css'
import cardStyles from '../styles/Cards.module.css'
import footerStyles from '../styles/Footer.module.css'
import './Editorial.css'

export function Editorial() {
  const { t } = useTranslation()

  const featureHighlights = [
    {
      title: t('editorial.features.socialNetwork.title'),
      description: t('editorial.features.socialNetwork.description'),
      notes: [
        t('editorial.features.socialNetwork.notes.follow'),
        t('editorial.features.socialNetwork.notes.join'),
        t('editorial.features.socialNetwork.notes.engage'),
      ],
    },
    {
      title: t('editorial.features.gameReviews.title'),
      description: t('editorial.features.gameReviews.description'),
      notes: [
        t('editorial.features.gameReviews.notes.visual'),
        t('editorial.features.gameReviews.notes.mechanic'),
        t('editorial.features.gameReviews.notes.platform'),
      ],
    },
    {
      title: t('editorial.features.essays.title'),
      description: t('editorial.features.essays.description'),
      notes: [
        t('editorial.features.essays.notes.psychology'),
        t('editorial.features.essays.notes.tech'),
        t('editorial.features.essays.notes.philosophical'),
      ],
    },
    {
      title: t('editorial.features.multimedia.title'),
      description: t('editorial.features.multimedia.description'),
      notes: [
        t('editorial.features.multimedia.notes.interviews'),
        t('editorial.features.multimedia.notes.lore'),
        t('editorial.features.multimedia.notes.moodboards'),
      ],
    },
  ]

  return (
    <div className={pageStyles.page}>
      <Navbar />

      <main className={pageStyles.pageContent} role="main">
        <div className="editorial-container">
          <section className={`${cardStyles.section} editorial-section`}>
            <div className={cardStyles.sectionHeader}>
              <h1>{t('editorialPage.title')}</h1>
              <p className="editorial-subtitle">{t('editorialPage.subtitle')}</p>
              <p>{t('editorialPage.description')}</p>
            </div>
            <div className="highlight-grid">
              {featureHighlights.map((feature) => (
                <article key={feature.title} className="highlight">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <ul>
                    {feature.notes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className={footerStyles.footer} role="contentinfo">
        <img className={footerStyles.footerLogo} src="/imgs/tellurian_white.png" alt="Tellurian" />
        <nav className={footerStyles.footerLinks} aria-label="Footer navigation">
          <Link to="/about" className={footerStyles.footerLink}>{t('footer.aboutUs')}</Link>
          <span className={footerStyles.footerSeparator} aria-hidden="true">|</span>
          <Link to="/editorial" className={footerStyles.footerLink}>{t('footer.focusEditorial')}</Link>
          <span className={footerStyles.footerSeparator} aria-hidden="true">|</span>
          <Link to="/contact" className={footerStyles.footerLink}>{t('footer.contactUs')}</Link>
        </nav>
        <div className={footerStyles.footerTextContainer}>
          <p className={footerStyles.footerText}>{t('common.madeBy')}</p>
          <p className={footerStyles.footerText}>{t('common.allRightsReserved')}</p>
        </div>
      </footer>
    </div>
  )
}
