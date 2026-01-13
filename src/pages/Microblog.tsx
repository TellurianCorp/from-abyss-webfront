import { MicroblogTimeline } from '../components/MicroblogTimeline'
import { Navbar } from '../components/Navbar'
import pageStyles from '../styles/Page.module.css'

/**
 * Get the current user ID for microblog features
 * 
 * TODO: Integrate with authentication system (LifeAuth, session, etc.)
 * 
 * For testing, you can temporarily return a test user ID:
 *   return 'test-user-123'
 * 
 * When userId is undefined:
 * - PostComposer will not be displayed
 * - Timeline will still show posts (read-only)
 * - Follow buttons and notifications won't appear
 */
const getUserId = (): string | undefined => {
  // TODO: Replace with actual authentication logic
  // Options:
  // 1. Use LifeAuth JWT token from session/cookies
  // 2. Use React Context for auth state
  // 3. Use localStorage/sessionStorage
  // 4. Call /v1/auth/me endpoint to get current user
  
  // For now, return undefined (read-only mode)
  // Uncomment below for testing:
  // return 'test-user-123'
  
  return undefined
}

export function Microblog() {
  const userId = getUserId()

  return (
    <div className={pageStyles.page}>
      <Navbar />
      <main className={pageStyles.pageContent} role="main">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
          <MicroblogTimeline userId={userId} />
        </div>
      </main>
    </div>
  )
}
