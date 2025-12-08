import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from './LanguageSelector'

export function AdminNavbar() {
  const { t } = useTranslation()
  const location = useLocation()
  const [expanded, setExpanded] = useState(false)

  const handleNavClick = () => {
    setExpanded(false)
  }

  return (
    <BootstrapNavbar
      expand="lg"
      className="custom-navbar admin-navbar"
      fixed="top"
      expanded={expanded}
      onToggle={setExpanded}
      style={{
        background: 'linear-gradient(180deg, rgba(12, 12, 12, 0.98), rgba(12, 12, 12, 0.95))',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        padding: '1rem 0',
        zIndex: 1000,
      }}
    >
      <Container fluid className="px-4 px-lg-5">
        <BootstrapNavbar.Brand as={Link} to="/admin" className="d-flex align-items-center gap-3">
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
              {t('admin.eyebrow') || 'From Abyss Control'}
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
              {t('admin.title') || 'Guardian Dashboard'}
            </p>
          </div>
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle
          aria-controls="admin-navbar-nav"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
          }}
        >
          <span style={{ color: '#E8E2D9' }}>☰</span>
        </BootstrapNavbar.Toggle>

        <BootstrapNavbar.Collapse id="admin-navbar-nav">
          <Nav className="ms-auto align-items-center gap-3">
            <Nav.Link
              as={Link}
              to="/admin"
              onClick={handleNavClick}
              active={location.pathname === '/admin'}
              style={{
                color: location.pathname === '/admin' ? '#E8E2D9' : '#B3A18E',
                fontSize: '0.85rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '0.4rem 0.6rem',
                transition: 'all 0.2s ease',
              }}
              className="custom-nav-link"
            >
              {t('admin.title') || 'Guardian Dashboard'}
            </Nav.Link>
            <NavDropdown
              title="Services"
              id="admin-services-dropdown"
              style={{
                color: '#E8E2D9',
                fontSize: '0.85rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              <NavDropdown.Item as={Link} to="/admin/patreon" onClick={handleNavClick}>
                Patreon
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/koliseum-admin" onClick={handleNavClick}>
                Koliseum
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link
              as={Link}
              to="/"
              onClick={handleNavClick}
              style={{
                color: '#B3A18E',
                fontSize: '0.85rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '0.4rem 0.6rem',
                transition: 'all 0.2s ease',
              }}
              className="custom-nav-link"
            >
              {t('common.returnToPortal') || 'Return to Portal'}
            </Nav.Link>
            <Nav.Item>
              <LanguageSelector />
            </Nav.Item>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  )
}
