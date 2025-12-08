import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import './PatreonSimpleCTA.css'

export function PatreonSimpleCTA() {
  return (
    <section className="section patreon-simple-cta-section">
      <Link to="/patreon" className="patreon-simple-cta-link">
        <div className="patreon-simple-cta-content">
          <div className="patreon-simple-cta-text">
            <span className="patreon-join-us-text">join us</span>
          </div>
        </div>
      </Link>
    </section>
  )
}
