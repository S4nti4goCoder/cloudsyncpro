import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // Si no está autenticado, redirigir al login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Parsear datos del usuario
  const userData = JSON.parse(user);
  const userRole = userData.role_user;

  // Si no tiene el rol necesario, redirigir según su rol
  if (!allowedRoles.includes(userRole)) {
    // Si es admin pero trata de acceder a ruta de user, redirigir a admin
    if (userRole === "admin") {
      return <Navigate to="/admin" replace />;
    }

    // Si es user pero trata de acceder a ruta de admin, redirigir a dashboard
    if (userRole === "user") {
      return <Navigate to="/dashboard" replace />;
    }

    // Por defecto, redirigir al login
    return <Navigate to="/login" replace />;
  }

  // Si tiene el rol correcto, mostrar el componente
  return children;
};

export default RoleProtectedRoute;
