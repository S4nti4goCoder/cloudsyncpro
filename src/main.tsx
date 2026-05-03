import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import { initSentry } from '@/lib/sentry'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

// Initialize Sentry before anything else so it can capture early errors.
initSentry()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found. Check your index.html file.')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)