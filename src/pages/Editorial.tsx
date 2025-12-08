import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LanguageSelector } from '../components/LanguageSelector'
import './Editorial.css'

function getIssueNumber() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0')
  return `${year}.${month}`
}

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
        <div className="editorial-container">
          <section className="section editorial-section">
            <div className="section-header">
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
