import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from './LanguageSelector'

function getIssueNumber() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0')
  return `${year}.${month}`
}

export function BootstrapNavbarComponent() {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const menuItems = [
    { id: 'articles', label: t('navbar.menu.articles', 'Articles'), path: '/#articles' },
    { id: 'comics', label: t('navbar.menu.comics', 'Comics'), path: '/#comics' },
    { id: 'books', label: t('navbar.menu.books', 'Books'), path: '/#books' },
    { id: 'music', label: t('navbar.menu.music', 'Music'), path: '/#music' },
    { id: 'games', label: t('navbar.menu.games', 'Games'), path: '/#games' },
    { id: 'movies', label: t('navbar.menu.movies', 'Movies'), path: '/#movies' },
  ]

  const handleNavClick = () => {
    setExpanded(false)
  }

  return (
    <BootstrapNavbar
      expand="lg"
      className="custom-navbar"
      fixed="top"
      expanded={expanded}
      onToggle={setExpanded}
      style={{
        background: 'linear-gradient(180deg, rgba(12, 12, 12, 0.98), rgba(12, 12, 12, 0.95))',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        padding: '1rem 0',
      }}
    >
      <Container fluid className="px-4 px-lg-5">
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-3">
          <img
            src="/imgs/logo.png"
            alt="From Abyss Media"
            style={{
              width: 'clamp(60px, 8vw, 90px)',
              height: 'auto',
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))',
            }}
          />
          <div className="d-flex flex-column">
            <span
              className="badge"
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#E8E2D9',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                width: 'fit-content',
              }}
            >
              {t('navbar.badge')}
            </span>
            <p
              className="mb-0"
              style={{
                fontFamily: "'Special Elite', cursive",
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#B3A18E',
                marginTop: '0.25rem',
              }}
            >
              {t('navbar.issue', { issue: getIssueNumber() })}
            </p>
          </div>
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle
          aria-controls="basic-navbar-nav"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
          }}
        >
          <span style={{ color: '#E8E2D9' }}>☰</span>
        </BootstrapNavbar.Toggle>

        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-3">
            {menuItems.map((item) => (
              <Nav.Link
                key={item.id}
                as={Link}
                to={item.path}
                onClick={handleNavClick}
                style={{
                  color: '#E8E2D9',
                  fontSize: '0.85rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  padding: '0.4rem 0.6rem',
                  transition: 'all 0.2s ease',
                }}
                className="custom-nav-link"
              >
                {item.label}
              </Nav.Link>
            ))}
            <Nav.Item>
              <LanguageSelector />
            </Nav.Item>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  )
}
