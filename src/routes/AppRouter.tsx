import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { AppShell } from "@/components/layout/AppShell";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const WorkspacesPage = lazy(() => import("@/pages/workspaces/WorkspacesPage"));
const FilesPage = lazy(() => import("@/pages/files/FilesPage"));
const SharedFilePage = lazy(() => import("@/pages/shared/SharedFilePage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const AdminPage = lazy(() => import("@/pages/admin/AdminPage"));
const ActivityPage = lazy(() => import("@/pages/activity/ActivityPage"));

function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta página se implementará en los próximos pasos.
        </p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.user !== null);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  if (!isInitialized) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <AppShell>{children}</AppShell>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.user !== null);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  if (!isInitialized) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Shared file — no auth required */}
        <Route path="/shared/:token" element={<SharedFilePage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/files"
          element={
            <ProtectedRoute>
              <FilesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces"
          element={
            <ProtectedRoute>
              <WorkspacesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Compartidos" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Notificaciones" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/archived"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Archivados" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trash"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Papelera" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Configuración" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <ActivityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
