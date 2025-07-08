const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const verifyToken = require("../middlewares/auth.middleware");
const { body } = require("express-validator");

router.get("/profile", verifyToken, userController.getProfile);

router.put(
  "/profile",
  verifyToken,
  [
    body("name_user")
      .optional()
      .notEmpty()
      .withMessage("Nombre no puede estar vacío"),
    body("email_user").optional().isEmail().withMessage("Correo inválido"),
  ],
  userController.updateProfile
);

router.put(
  "/change-password",
  [
    verifyToken,
    body("current_password")
      .notEmpty()
      .withMessage("La contraseña actual es requerida"),
    body("new_password")
      .isLength({ min: 6 })
      .withMessage("La nueva contraseña debe tener al menos 6 caracteres"),
  ],
  userController.changePassword
);

module.exports = router;
