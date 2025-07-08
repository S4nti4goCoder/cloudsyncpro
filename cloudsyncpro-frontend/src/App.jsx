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

// Componentes de rutas
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthRoute from "./components/auth/AuthRoute";

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

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Ruta para URLs no encontradas */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Configuración global de Sonner - posición centrada arriba */}
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

export default App;
