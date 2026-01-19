import { Navbar } from '../components/Navbar'
import { MicroblogTimeline } from '../components/MicroblogTimeline'
import { FederationStatus } from '../components/widgets/FederationStatus'
import { TrendingWidget } from '../components/widgets/TrendingWidget'
import { SuggestedFollows } from '../components/widgets/SuggestedFollows'
import { RecentActivity } from '../components/widgets/RecentActivity'
import { useUser } from '../hooks/useUser'
import pageStyles from '../styles/Page.module.css'
import landingStyles from '../styles/Landing.module.css'

export function Landing() {
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
