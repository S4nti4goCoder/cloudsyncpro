import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthInitializer } from "@/hooks/useAuth";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useTheme } from "@/hooks/useTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppRoutes } from '@/routes/AppRouter'

function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthInitializer();
  useNetworkStatus();
  // Apply theme at the app root so it works for routes outside AppShell
  // (login, register, 404, password recovery).
  useTheme();
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
