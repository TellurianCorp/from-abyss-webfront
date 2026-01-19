import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LanguageSelector } from './LanguageSelector'
import { WeatherShader } from './WeatherShader'
import { ProfileDropdown } from './ProfileDropdown'
import { useUser } from '../hooks/useUser'
import styles from '../styles/Navbar.module.css'

function getIssueNumber() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0')
  return `${year}.${month}`
}

export function Navbar() {
  const { t } = useTranslation()
  const { userInfo } = useUser()

  const menuItems = [
    { id: 'articles', label: t('navbar.menu.articles', 'Articles'), url: '/editorial#articles' },
    { id: 'comics', label: t('navbar.menu.comics', 'Comics'), url: '/editorial#comics' },
    { id: 'books', label: t('navbar.menu.books', 'Books'), url: '/editorial#books' },
    { id: 'music', label: t('navbar.menu.music', 'Music'), url: '/editorial#music' },
    { id: 'games', label: t('navbar.menu.games', 'Games'), url: '/editorial#games' },
    { id: 'movies', label: t('navbar.menu.movies', 'Movies'), url: '/editorial#movies' },
  ]

  return (
    <header className={styles.navbar} role="banner" itemScope itemType="https://schema.org/WPHeader">
      <WeatherShader />
      <nav className={styles.navbarContent} aria-label="Main navigation">
        <div className={styles.navbarTop}>
          <div className={styles.navbarLeft}>
            <Link to="/" aria-label="From Abyss Media Home">
              <img 
                src="/imgs/logo.png" 
                alt="From Abyss Media" 
                className={styles.navbarLogo} 
                itemProp="logo"
                width="40"
                height="40"
              />
            </Link>
            <div className={styles.navbarBrand}>
              <span className={styles.navbarBadge}>{t('navbar.badge')}</span>
              <p className={styles.navbarIssue}>{t('navbar.issue', { issue: getIssueNumber() })}</p>
            </div>
          </div>
          <div className={styles.navbarRight}>
            <div className={styles.navbarActions}>
              {userInfo && (
                <ProfileDropdown 
                  userInfo={userInfo}
                  onLogout={() => {
                    // Clear user info from localStorage
                    localStorage.removeItem('userInfo')
                  }}
                />
              )}
              <div className={styles.navbarLanguage}>
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.navbarMenuRow}>
          <ul className={styles.navbarMenu} role="menubar" itemScope itemType="https://schema.org/SiteNavigationElement">
            {menuItems.map((item, index, array) => (
              <li key={item.id} role="none">
                <Link 
                  to={item.url} 
                  className={styles.navbarMenuItem}
                  role="menuitem"
                  itemProp="url"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
                {index < array.length - 1 && <span className={styles.navbarMenuSeparator} aria-hidden="true">|</span>}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}
