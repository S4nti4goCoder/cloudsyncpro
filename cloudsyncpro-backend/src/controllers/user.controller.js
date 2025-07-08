const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const pool = require("../config/db.config");
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res) => {
  try {
    const profile = await userService.getUserProfile(req.user.id_user);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const result = await userService.updateUserProfile(
      req.user.id_user,
      req.body
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { current_password, new_password } = req.body;
  const id_user = req.user.id_user;

  try {
    const [rows] = await pool.query(
      "SELECT password_user FROM users WHERE id_user = ?",
      [id_user]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const passwordMatch = await bcrypt.compare(
      current_password,
      rows[0].password_user
    );
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "La contraseña actual es incorrecta" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE users SET password_user = ? WHERE id_user = ?", [
      hashedPassword,
      id_user,
    ]);

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
