const { validationResult } = require("express-validator");
const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const result = await authService.registerUser(req.body, req);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const result = await authService.loginUser(req.body, req);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      message: "Refresh token requerido",
    });
  }

  try {
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (err) {
    // Si el refresh token es inválido o expirado, el usuario debe hacer login
    res.status(401).json({
      message: err.message,
      requireLogin: true,
    });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  const userId = req.user?.id_user; // Si viene del middleware de auth

  try {
    const result = await authService.logoutUser(refreshToken, userId);
    res.json(result);
  } catch (err) {
    // En logout, siempre respondemos 200 aunque haya errores
    res.json({ message: "Logout completado" });
  }
};

exports.recoverPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const result = await authService.recoverPassword(req.body.email_user);
    res.json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { token, new_password } = req.body;

  try {
    const result = await authService.resetPassword(token, new_password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
