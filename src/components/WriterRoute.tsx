import { useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import styles from './WriterRoute.module.css'

interface WriterRouteProps {
  children: React.ReactNode
}

/**
 * Guards routes that require the writer capability, which comes from the user
 * session. Distinct from AdminRoute, which guards the admin console against a
 * separate identity system.
 */
export function WriterRoute({ children }: WriterRouteProps) {
  const { userInfo, isLoading, canWriteArticles } = useUser()
  const location = useLocation()
  // Stabilised by reference: Navigate's redirect effect depends on this
  // object by identity, and a fresh `{ from: ... }` literal on every render
  // would retrigger that effect forever whenever this guard isn't unmounted
  // by a matching <Route> (e.g. when rendered standalone in a test).
  const redirectState = useMemo(() => ({ from: location.pathname }), [location.pathname])

  if (isLoading) {
    return <div className={styles.checking}>Loading...</div>
  }

  if (!userInfo || !canWriteArticles) {
    return <Navigate to="/articles" state={redirectState} replace />
  }

  return <>{children}</>
}
