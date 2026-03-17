import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import pageStyles from '../styles/Page.module.css'
import cardStyles from '../styles/Cards.module.css'
import footerStyles from '../styles/Footer.module.css'
import './Home.css'
import { useSEO } from '../hooks/useSEO'

export function Home() {
  const { t } = useTranslation()

  useSEO({
    title: 'From Abyss Media',
    description: 'Horror Social Network, Reviews & Multimedia Platform',
    image: 'https://fromabyss.com/imgs/cover.png',
    url: 'https://fromabyss.com/',
    type: 'website',
    siteName: 'From Abyss Media',
  })

  return (
    <div className={pageStyles.page}>
      <Navbar />

      <main className={pageStyles.pageContent} role="main">
        <div className="home-container">
          <section className={`${cardStyles.section} home-section`}>
            <div className={cardStyles.sectionHeader}>
              <h1>From Abyss Media</h1>
              <p className="home-subtitle">{t('about.subtitle', 'Horror Social Network, Reviews & Multimedia Platform')}</p>
            </div>
            <div className="home-links">
              <Link to="/microblog" className="home-link">Microblog</Link>
              <Link to="/about" className="home-link">About</Link>
              <Link to="/editorial" className="home-link">Editorial</Link>
              <Link to="/articles" className="home-link">Articles</Link>
              <Link to="/contact" className="home-link">Contact</Link>
              <Link to="/roadmap" className="home-link">Roadmap</Link>
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
