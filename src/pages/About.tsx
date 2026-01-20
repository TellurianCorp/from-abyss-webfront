import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import pageStyles from '../styles/Page.module.css'
import cardStyles from '../styles/Cards.module.css'
import footerStyles from '../styles/Footer.module.css'
import './About.css'
import { useSEO } from '../hooks/useSEO'

export function About() {
  const { t } = useTranslation()

  useSEO({
    title: t('seo.about.title'),
    description: t('seo.about.description'),
    image: 'https://fromabyss.com/imgs/cover.png',
    url: 'https://fromabyss.com/about',
    type: 'website',
    siteName: 'From Abyss Media',
  })

  return (
    <div className={pageStyles.page}>
      <Navbar />

      <main className={pageStyles.pageContent} role="main">
        <div className="about-container">
          <section className={`${cardStyles.section} about-section`}>
            <div className={cardStyles.sectionHeader}>
              <h1>{t('about.title')}</h1>
              <p className="about-subtitle">{t('about.subtitle')}</p>
            </div>
            <div className="about-content">
              <p>{t('about.history.p1')}</p>
              <p>{t('about.history.p2')}</p>
              <p>{t('about.history.p3')}</p>
              <p>{t('about.history.p4')}</p>
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
