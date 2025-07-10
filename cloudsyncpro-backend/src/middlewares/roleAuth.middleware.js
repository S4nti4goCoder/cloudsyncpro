// middlewares/roleAuth.middleware.js
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // El middleware de autenticación debe haber sido ejecutado antes
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: "Token de autenticación requerido",
      });
    }

    const userRole = req.user.role_user;

    // Verificar si el rol del usuario está en los roles permitidos
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: true,
        message: "No tienes permisos para acceder a este recurso",
        requiredRole: allowedRoles,
        userRole: userRole,
      });
    }

    next();
  };
};

// Middlewares específicos para roles comunes
const requireAdmin = requireRole(["admin"]);
const requireUser = requireRole(["user", "admin"]); // Admin puede hacer todo lo que hace un user
const requireAdminOnly = requireRole(["admin"]); // Solo admin, sin incluir user

// Middleware para verificar si es propietario del recurso O admin
const requireOwnershipOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: "Token de autenticación requerido",
      });
    }

    const userRole = req.user.role_user;
    const userId = req.user.id_user;

    // Si es admin, puede acceder a cualquier recurso
    if (userRole === "admin") {
      return next();
    }

    try {
      // Obtener el ID del propietario del recurso
      const resourceOwnerId = await getResourceOwnerId(req);

      // Verificar si el usuario es el propietario
      if (userId === resourceOwnerId) {
        return next();
      }

      return res.status(403).json({
        error: true,
        message: "No tienes permisos para acceder a este recurso",
      });
    } catch (error) {
      console.error("Error verificando ownership:", error);
      return res.status(500).json({
        error: true,
        message: "Error interno del servidor",
      });
    }
  };
};

// Helper para verificar roles en servicios
const hasRole = (user, requiredRoles) => {
  if (!user || !user.role_user) return false;
  return requiredRoles.includes(user.role_user);
};

// Helper para verificar si es admin
const isAdmin = (user) => {
  return user && user.role_user === "admin";
};

// Helper para verificar si es propietario o admin
const isOwnerOrAdmin = (user, resourceOwnerId) => {
  if (!user) return false;
  return user.role_user === "admin" || user.id_user === resourceOwnerId;
};

module.exports = {
  requireRole,
  requireAdmin,
  requireUser,
  requireAdminOnly,
  requireOwnershipOrAdmin,
  hasRole,
  isAdmin,
  isOwnerOrAdmin,
};
