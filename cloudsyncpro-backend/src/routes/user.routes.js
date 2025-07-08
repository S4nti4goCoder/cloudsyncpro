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

module.exports = router;
