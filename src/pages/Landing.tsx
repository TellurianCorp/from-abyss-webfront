import { Navbar } from '../components/Navbar'
import { YouTubeHighlights } from '../components/YouTubeHighlights'
import { useTranslation } from 'react-i18next'
import pageStyles from '../styles/Page.module.css'
import landingStyles from '../styles/Landing.module.css'
import { useSEO } from '../hooks/useSEO'

export function Landing() {
  const { t } = useTranslation()

  useSEO({
    title: t('seo.landing.title', 'From Abyss Media - Horror Social Network, Reviews & Multimedia Platform'),
    description: t('seo.landing.description', 'Immersive platform for horror fans & creators. Social networking, reviews, essays, and multimedia productions converging at the intersection of technology and dread.'),
    image: 'https://fromabyss.com/imgs/cover.png',
    url: 'https://fromabyss.com/',
    type: 'website',
    siteName: 'From Abyss Media',
  })

  return (
    <div className={pageStyles.page}>
      <Navbar />

      <main className={`${pageStyles.pageContent} ${landingStyles.magazineMain}`} role="main">
        <div className={landingStyles.magazineGrid}>
          {/* Left Column */}
          <div className={landingStyles.magazineColumn}>
            <section className={landingStyles.magazineSection}>
              <h2 className={landingStyles.magazineSectionTitle}>Featured Articles</h2>
              <div className={landingStyles.magazineCard}>
                <div className={landingStyles.magazineCardImage}>
                  <div className={landingStyles.magazinePlaceholder}>Image</div>
                </div>
                <div className={landingStyles.magazineCardContent}>
                  <h3 className={landingStyles.magazineCardTitle}>The Art of Horror</h3>
                  <p className={landingStyles.magazineCardExcerpt}>
                    Exploring the depths of horror storytelling and its impact on modern culture.
                  </p>
                  <span className={landingStyles.magazineCardMeta}>Read More →</span>
                </div>
              </div>
              
              <div className={landingStyles.magazineCard}>
                <div className={landingStyles.magazineCardImage}>
                  <div className={landingStyles.magazinePlaceholder}>Image</div>
                </div>
                <div className={landingStyles.magazineCardContent}>
                  <h3 className={landingStyles.magazineCardTitle}>Underground Cinema</h3>
                  <p className={landingStyles.magazineCardExcerpt}>
                    A journey through the most disturbing films that shaped the genre.
                  </p>
                  <span className={landingStyles.magazineCardMeta}>Read More →</span>
                </div>
              </div>
            </section>

            <section className={landingStyles.magazineSection}>
              <h2 className={landingStyles.magazineSectionTitle}>Comics & Zines</h2>
              <div className={landingStyles.magazineCard}>
                <div className={landingStyles.magazineCardContent}>
                  <h3 className={landingStyles.magazineCardTitle}>Issue #42: The Void</h3>
                  <p className={landingStyles.magazineCardExcerpt}>
                    This month's collection features stories from the abyss.
                  </p>
                  <span className={landingStyles.magazineCardMeta}>View Issue →</span>
                </div>
              </div>
            </section>
          </div>

          {/* Center Column - Main Content */}
          <div className={`${landingStyles.magazineColumn} ${landingStyles.magazineColumnCenter}`}>
            <section className={landingStyles.magazineHero}>
              <div className={landingStyles.magazineHeroImage}>
                <div className={landingStyles.magazinePlaceholder}>Hero Image</div>
              </div>
              <div className={landingStyles.magazineHeroContent}>
                <h1 className={landingStyles.magazineHeroTitle}>From the Abyss</h1>
                <p className={landingStyles.magazineHeroSubtitle}>
                  Connecting the global horror community through art, stories, and shared nightmares.
                </p>
              </div>
            </section>

            <section className={landingStyles.magazineSection}>
              <h2 className={landingStyles.magazineSectionTitle}>Video Highlights</h2>
              <YouTubeHighlights />
            </section>

            <section className={landingStyles.magazineSection}>
              <h2 className={landingStyles.magazineSectionTitle}>Latest Reviews</h2>
              <div className={landingStyles.magazineCard}>
                <div className={landingStyles.magazineCardContent}>
                  <h3 className={landingStyles.magazineCardTitle}>Book Review: "The Descent"</h3>
                  <p className={landingStyles.magazineCardExcerpt}>
                    A deep dive into one of the most unsettling horror novels of the decade.
                  </p>
                  <span className={landingStyles.magazineCardMeta}>Read Review →</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className={landingStyles.magazineColumn}>
            <section className={landingStyles.magazineSection}>
              <h2 className={landingStyles.magazineSectionTitle}>Music & Sound</h2>
              <div className={landingStyles.magazineCard}>
                <div className={landingStyles.magazineCardImage}>
                  <div className={landingStyles.magazinePlaceholder}>Album Art</div>
                </div>
                <div className={landingStyles.magazineCardContent}>
                  <h3 className={landingStyles.magazineCardTitle}>Dark Ambient Collection</h3>
                  <p className={landingStyles.magazineCardExcerpt}>
                    Curated selection of atmospheric horror soundscapes.
                  </p>
                  <span className={landingStyles.magazineCardMeta}>Listen →</span>
                </div>
              </div>
            </section>

            <section className={landingStyles.magazineSection}>
              <h2 className={landingStyles.magazineSectionTitle}>Games</h2>
              <div className={landingStyles.magazineCard}>
                <div className={landingStyles.magazineCardContent}>
                  <h3 className={landingStyles.magazineCardTitle}>Indie Horror Spotlight</h3>
                  <p className={landingStyles.magazineCardExcerpt}>
                    Discover the most terrifying indie games you've never heard of.
                  </p>
                  <span className={landingStyles.magazineCardMeta}>Explore →</span>
                </div>
              </div>
            </section>

            <section className={landingStyles.magazineSection}>
              <h2 className={landingStyles.magazineSectionTitle}>Community</h2>
              <div className={landingStyles.magazineCard}>
                <div className={landingStyles.magazineCardContent}>
                  <h3 className={landingStyles.magazineCardTitle}>Join the Horrorverse</h3>
                  <p className={landingStyles.magazineCardExcerpt}>
                    Connect with fellow horror enthusiasts and share your darkest creations.
                  </p>
                  <span className={landingStyles.magazineCardMeta}>Join Now →</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
