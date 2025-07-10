const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { body } = require("express-validator");
const verifyToken = require("../middlewares/auth.middleware");

// Importar rate limiters
const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
} = require("../middlewares/rateLimiter");

// Importar validador de contraseñas
const { validatePasswordMiddleware } = require("../utils/passwordValidator");

// Ruta de registro con validación de contraseña mejorada
router.post(
  "/register",
  registerLimiter,
  [
    body("name_user").notEmpty().withMessage("El nombre es obligatorio"),
    body("email_user").isEmail().withMessage("Email inválido"),
    body("password_user").notEmpty().withMessage("La contraseña es requerida"),
  ],
  validatePasswordMiddleware, // Nueva validación de contraseña
  authController.register
);

// Ruta de login (sin cambios en validación)
router.post(
  "/login",
  loginLimiter,
  [
    body("email_user").isEmail().withMessage("Email inválido"),
    body("password_user").notEmpty().withMessage("Contraseña requerida"),
  ],
  authController.login
);

// Ruta de recuperación de contraseña (sin cambios)
router.post(
  "/recover-password",
  forgotPasswordLimiter,
  [body("email_user").isEmail().withMessage("Email inválido")],
  authController.recoverPassword
);

// Ruta de reset password con validación de contraseña mejorada
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token requerido"),
    body("new_password")
      .notEmpty()
      .withMessage("La nueva contraseña es requerida"),
  ],
  validatePasswordMiddleware, // Nueva validación de contraseña
  authController.resetPassword
);

router.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Ruta protegida accedida correctamente",
    user: req.user,
  });
});

router.post("/validate-password", (req, res) => {
  const { validatePasswordStrength } = require("../utils/passwordValidator");
  const password = req.body.password;

  if (!password) {
    return res.status(400).json({
      error: true,
      message: "Contraseña requerida",
    });
  }

  const validation = validatePasswordStrength(password);

  res.json({
    success: true,
    validation: {
      isValid: validation.isValid,
      errors: validation.errors,
      requirements: validation.requirements,
      strengthScore: validation.strengthScore,
      strengthLevel: validation.strengthLevel,
      suggestions: validation.suggestions,
    },
  });
});

module.exports = router;
