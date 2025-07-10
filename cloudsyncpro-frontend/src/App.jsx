import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";

// Páginas
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Componentes de rutas
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthRoute from "./components/auth/AuthRoute";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Rutas de autenticación */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthRoute>
                <ForgotPassword />
              </AuthRoute>
            }
          />

          {/* Rutas protegidas para usuarios regulares */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["user"]}>
                  <Dashboard />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          {/* Rutas protegidas para administradores */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          {/* Redirección inteligente por defecto */}
          <Route path="/" element={<SmartRedirect />} />

          {/* Ruta para URLs no encontradas */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Configuración global de Sonner */}
        <Toaster
          position="top-center"
          expand={true}
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            style: {
              margin: "0 auto",
              width: "fit-content",
              maxWidth: "400px",
            },
          }}
        />
      </div>
    </Router>
  );
}

// Componente para redirección inteligente según el rol
const SmartRedirect = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const userData = JSON.parse(user);
  const userRole = userData.role_user;

  // Redirigir según el rol
  if (userRole === "admin") {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

export default App;
