import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './index.css'
import './i18n/config'
import { ToastProvider } from './contexts/ToastContext'
import { MicroblogProvider } from './contexts/MicroblogContext'
import { ActivityPubProvider } from './contexts/ActivityPubContext'
import { NotificationProvider } from './contexts/NotificationContext'
import App from './App.tsx'

// Configure React Query for optimal performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000, // Data is fresh for 10 seconds
      gcTime: 5 * 60 * 1000, // Cache for 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true, // Refetch on network reconnect
      retry: 1, // Retry failed requests once
      refetchInterval: false, // Disable default polling (use custom hooks)
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <MicroblogProvider>
            <ActivityPubProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </ActivityPubProvider>
          </MicroblogProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
