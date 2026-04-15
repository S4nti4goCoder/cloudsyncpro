import { BrowserRouter } from 'react-router-dom'
import { useAuthInitializer } from '@/hooks/useAuth'
import { AppRoutes } from '@/routes/AppRouter'

/**
 * Auth initializer wrapper — keeps App clean.
 */
function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthInitializer()
  return <>{children}</>
}

/**
 * Root application component.
 * Sets up routing and auth initialization.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}