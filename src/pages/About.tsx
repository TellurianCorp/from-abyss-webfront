import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LanguageSelector } from '../components/LanguageSelector'
import './About.css'

function getIssueNumber() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0')
  return `${year}.${month}`
}

export function About() {
  const { t } = useTranslation()

  return (
    <div className="page">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-top">
            <div className="navbar-left">
              <Link to="/">
                <img src="/imgs/logo.png" alt="From Abyss Media" className="navbar-logo" />
              </Link>
              <div className="navbar-brand">
                <span className="navbar-badge">{t('navbar.badge')}</span>
                <p className="navbar-issue">{t('navbar.issue', { issue: getIssueNumber() })}</p>
              </div>
            </div>
            <div className="navbar-right">
              <div className="navbar-language">
                <LanguageSelector />
              </div>
            </div>
          </div>
          <div className="navbar-menu-row">
            <div className="navbar-menu">
              {[
                { id: 'articles', label: t('navbar.menu.articles', 'Articles') },
                { id: 'comics', label: t('navbar.menu.comics', 'Comics') },
                { id: 'books', label: t('navbar.menu.books', 'Books') },
                { id: 'music', label: t('navbar.menu.music', 'Music') },
                { id: 'games', label: t('navbar.menu.games', 'Games') },
                { id: 'movies', label: t('navbar.menu.movies', 'Movies') },
              ].map((item, index, array) => (
                <span key={item.id}>
                  <Link to={`/#${item.id}`} className="navbar-menu-item">
                    {item.label}
                  </Link>
                  {index < array.length - 1 && <span className="navbar-menu-separator">|</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="page-content">
        <div className="about-container">
          <section className="section about-section">
            <div className="section-header">
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
      </div>
      <footer className="footer">
        <img className="footer-logo" src="/imgs/tellurian_white.png" alt="Tellurian" />
        <div className="footer-links">
          <Link to="/about" className="footer-link">{t('footer.aboutUs')}</Link>
          <span className="footer-separator">|</span>
          <Link to="/editorial" className="footer-link">{t('footer.focusEditorial')}</Link>
          <span className="footer-separator">|</span>
          <Link to="/contact" className="footer-link">{t('footer.contactUs')}</Link>
        </div>
        <div className="footer-text-container">
          <p className="footer-text">{t('common.madeBy')}</p>
          <p className="footer-text">{t('common.allRightsReserved')}</p>
        </div>
      </footer>
    </div>
  )
}
