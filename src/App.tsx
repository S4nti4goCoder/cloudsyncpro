import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthInitializer } from "@/hooks/useAuth";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppRoutes } from '@/routes/AppRouter'

function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthInitializer();
  useNetworkStatus();
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
