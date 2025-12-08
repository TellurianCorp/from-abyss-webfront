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

  const menuItems = [
    { id: 'articles', label: t('navbar.menu.articles', 'Articles'), url: '/editorial#articles' },
    { id: 'comics', label: t('navbar.menu.comics', 'Comics'), url: '/editorial#comics' },
    { id: 'books', label: t('navbar.menu.books', 'Books'), url: '/editorial#books' },
    { id: 'music', label: t('navbar.menu.music', 'Music'), url: '/editorial#music' },
    { id: 'games', label: t('navbar.menu.games', 'Games'), url: '/editorial#games' },
    { id: 'movies', label: t('navbar.menu.movies', 'Movies'), url: '/editorial#movies' },
  ]

  return (
    <header className="navbar" role="banner" itemScope itemType="https://schema.org/WPHeader">
      <WeatherShader />
      <nav className="navbar-content" aria-label="Main navigation">
        <div className="navbar-top">
          <div className="navbar-left">
            <Link to="/" aria-label="From Abyss Media Home">
              <img 
                src="/imgs/logo.png" 
                alt="From Abyss Media" 
                className="navbar-logo" 
                itemProp="logo"
                width="40"
                height="40"
              />
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
          <ul className="navbar-menu" role="menubar" itemScope itemType="https://schema.org/SiteNavigationElement">
            {menuItems.map((item, index, array) => (
              <li key={item.id} role="none">
                <Link 
                  to={item.url} 
                  className="navbar-menu-item"
                  role="menuitem"
                  itemProp="url"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
                {index < array.length - 1 && <span className="navbar-menu-separator" aria-hidden="true">|</span>}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}
