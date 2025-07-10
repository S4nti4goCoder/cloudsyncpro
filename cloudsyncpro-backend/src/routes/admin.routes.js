// routes/admin.routes.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const adminController = require("../controllers/admin.controller");
const verifyToken = require("../middlewares/auth.middleware");
const { requireAdminOnly } = require("../middlewares/roleAuth.middleware");

// Aplicar middleware de autenticación y autorización a todas las rutas
router.use(verifyToken);
router.use(requireAdminOnly);

// Dashboard de administrador
router.get("/dashboard/stats", adminController.getDashboardStats);
router.get("/activity/recent", adminController.getRecentActivity);

// Gestión de usuarios
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);

// Crear nuevo usuario
router.post(
  "/users",
  [
    body("name_user")
      .notEmpty()
      .withMessage("El nombre es obligatorio")
      .isLength({ min: 2, max: 100 })
      .withMessage("El nombre debe tener entre 2 y 100 caracteres"),
    body("email_user").isEmail().withMessage("Email inválido").normalizeEmail(),
    body("password_user")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("role_user")
      .optional()
      .isIn(["admin", "user"])
      .withMessage("Rol inválido"),
  ],
  adminController.createUser
);

// Actualizar rol de usuario
router.put(
  "/users/:id/role",
  [body("role").isIn(["admin", "user"]).withMessage("Rol inválido")],
  adminController.updateUserRole
);

// Actualizar estado de usuario
router.put(
  "/users/:id/status",
  [
    body("status")
      .isIn(["active", "banned", "inactive"])
      .withMessage("Estado inválido"),
  ],
  adminController.updateUserStatus
);

// Eliminar usuario
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
