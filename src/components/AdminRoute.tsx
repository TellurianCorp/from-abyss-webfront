import { useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './AdminRoute.module.css'

interface AdminRouteProps {
  children: React.ReactNode
}

/**
 * Guards the admin console, which authenticates against /v1/admin/me — an
 * identity system separate from the OIDC user session. For routes that depend
 * on the user session, use WriterRoute.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isChecking } = useAuth()
  const location = useLocation()
  // Stabilised by reference: Navigate's redirect effect depends on this
  // object by identity, and a fresh `{ from: ... }` literal on every render
  // would retrigger that effect forever whenever this guard isn't unmounted
  // by a matching <Route> (e.g. when rendered standalone in a test).
  const redirectState = useMemo(() => ({ from: location.pathname }), [location.pathname])

  if (isChecking) {
    return <div className={styles.checking}>Loading...</div>
  }

  if (!isAuthenticated) {
    // Redirect to login page, saving the current location
    return <Navigate to="/admin/login" state={redirectState} replace />
  }

  return <>{children}</>
}
