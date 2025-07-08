const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { body } = require("express-validator");
const verifyToken = require("../middlewares/auth.middleware");

// Ruta de registro
router.post(
  "/register",
  [
    body("name_user").notEmpty().withMessage("El nombre es obligatorio"),
    body("email_user").isEmail().withMessage("Email inválido"),
    body("password_user")
      .isLength({ min: 6 })
      .withMessage("Mínimo 6 caracteres"),
  ],
  authController.register
);

// Ruta de login
router.post(
  "/login",
  [body("email_user").isEmail(), body("password_user").notEmpty()],
  authController.login
);

router.post(
  "/recover-password",
  [body("email_user").isEmail().withMessage("Email inválido")],
  authController.recoverPassword
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token requerido"),
    body("new_password")
      .isLength({ min: 6 })
      .withMessage("Mínimo 6 caracteres"),
  ],
  authController.resetPassword
);

router.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Ruta protegida accedida correctamente",
    user: req.user,
  });
});

module.exports = router;
