import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthInitializer } from "@/hooks/useAuth";
import { AppRoutes } from '@/routes/AppRouter'

function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthInitializer();
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
}
