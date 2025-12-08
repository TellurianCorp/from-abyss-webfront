import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LanguageSelector } from './LanguageSelector'
import { WeatherShader } from './WeatherShader'

function getIssueNumber() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0')
  return `${year}.${month}`
}

export function Navbar() {
  const { t } = useTranslation()

  return (
    <nav className="navbar">
      <WeatherShader />
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
                <a href={`#${item.id}`} className="navbar-menu-item">
                  {item.label}
                </a>
                {index < array.length - 1 && <span className="navbar-menu-separator">|</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
