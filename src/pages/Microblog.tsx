import { Navbar } from '../components/Navbar'
import { MicroblogTimeline } from '../components/MicroblogTimeline'
import { FederationStatus } from '../components/widgets/FederationStatus'
import { TrendingWidget } from '../components/widgets/TrendingWidget'
import { SuggestedFollows } from '../components/widgets/SuggestedFollows'
import { RecentActivity } from '../components/widgets/RecentActivity'
import { useTranslation } from 'react-i18next'
import { useUser } from '../hooks/useUser'
import pageStyles from '../styles/Page.module.css'
import landingStyles from '../styles/Landing.module.css'
import { useSEO } from '../hooks/useSEO'

export function Microblog() {
  const { t } = useTranslation()

  useSEO({
    title: t('seo.microblog.title'),
    description: t('seo.microblog.description'),
    image: 'https://fromabyss.com/imgs/cover.png',
    url: 'https://fromabyss.com/microblog',
    type: 'website',
    siteName: 'From Abyss Media',
  })

  const { userInfo } = useUser()

  return (
    <div className={pageStyles.page}>
      <Navbar />

      <main className={`${pageStyles.pageContent} ${landingStyles.landingMain}`} role="main">
        <div className={landingStyles.landingGrid}>
          {/* Sidebar with widgets */}
          <aside className={landingStyles.sidebar} aria-label="Sidebar">
            <FederationStatus />
            <TrendingWidget />
            <SuggestedFollows />
            <RecentActivity />
          </aside>

          {/* Main feed */}
          <div className={landingStyles.mainFeed}>
            <MicroblogTimeline userId={userInfo?.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
