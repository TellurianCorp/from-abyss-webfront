import { useEffect } from 'react'

interface ExternalRedirectProps {
  to: string
}

export function ExternalRedirect({ to }: ExternalRedirectProps) {
  useEffect(() => {
    window.location.href = to
  }, [to])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '50vh' 
    }}>
      <div>Redirecionando...</div>
    </div>
  )
}
