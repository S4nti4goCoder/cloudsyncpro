import { Navigate } from "react-router-dom";

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // Si el usuario YA está logueado, redirigir según su rol
  if (token && user) {
    const userData = JSON.parse(user);
    const userRole = userData.role_user;

    // Redirigir según el rol
    if (userRole === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Si NO está logueado, mostrar la página de autenticación
  return children;
};

export default AuthRoute;
