import { Navigate } from "react-router-dom";

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // Si el usuario YA está logueado, redirigir al dashboard
  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si NO está logueado, mostrar la página de autenticación
  return children;
};

export default AuthRoute;
