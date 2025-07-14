// routes/user.routes.js - ARCHIVO RECREADO
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/user.controller");
const verifyToken = require("../middlewares/auth.middleware");

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

/**
 * GET /api/user/profile
 * Obtener perfil del usuario autenticado
 */
router.get("/profile", userController.getProfile);

/**
 * PUT /api/user/profile
 * Actualizar perfil del usuario
 */
router.put(
  "/profile",
  [
    body("name_user")
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage("El nombre debe tener entre 2 y 100 caracteres")
      .trim(),
    body("email_user")
      .optional()
      .isEmail()
      .withMessage("Email inválido")
      .normalizeEmail(),
  ],
  userController.updateProfile
);

/**
 * PUT /api/user/change-password
 * Cambiar contraseña del usuario
 */
router.put(
  "/change-password",
  [
    body("current_password")
      .notEmpty()
      .withMessage("La contraseña actual es requerida"),
    body("new_password")
      .isLength({ min: 8 })
      .withMessage("La nueva contraseña debe tener al menos 8 caracteres")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .withMessage(
        "La nueva contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial"
      ),
  ],
  userController.changePassword
);

/**
 * GET /api/user/stats
 * Obtener estadísticas del usuario (archivos, carpetas, etc.)
 */
router.get("/stats", async (req, res) => {
  try {
    const userId = req.user.id_user;
    const db = require("../config/db");

    const [stats] = await db.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM folders WHERE owner_user_id = ?) as total_folders,
        (SELECT COUNT(*) FROM files WHERE owner_user_id = ?) as total_files,
        (SELECT COUNT(*) FROM folders WHERE owner_user_id = ? AND created_at_folder >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as folders_this_week,
        (SELECT COUNT(*) FROM files WHERE owner_user_id = ? AND created_at_file >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as files_this_week
    `,
      [userId, userId, userId, userId]
    );

    res.json({
      success: true,
      message: "Estadísticas obtenidas exitosamente",
      data: stats[0],
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas del usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

/**
 * GET /api/user/recent-activity
 * Obtener actividad reciente del usuario
 */
router.get("/recent-activity", async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { limit = 10 } = req.query;
    const db = require("../config/db");

    // Obtener carpetas recientes
    const [recentFolders] = await db.query(
      `
      SELECT 
        'folder' as type,
        'created' as action,
        id_folder as item_id,
        name_folder as item_name,
        created_at_folder as timestamp
      FROM folders 
      WHERE owner_user_id = ?
      ORDER BY created_at_folder DESC 
      LIMIT ?
    `,
      [userId, parseInt(limit)]
    );

    // Obtener archivos recientes
    const [recentFiles] = await db.query(
      `
      SELECT 
        'file' as type,
        'created' as action,
        id_file as item_id,
        name_file as item_name,
        created_at_file as timestamp
      FROM files 
      WHERE owner_user_id = ?
      ORDER BY created_at_file DESC 
      LIMIT ?
    `,
      [userId, parseInt(limit)]
    );

    // Combinar y ordenar actividad
    const allActivity = [...recentFolders, ...recentFiles]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      message: "Actividad reciente obtenida exitosamente",
      data: allActivity,
    });
  } catch (error) {
    console.error("Error obteniendo actividad reciente:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

/**
 * DELETE /api/user/account
 * Eliminar cuenta del usuario (soft delete)
 */
router.delete("/account", async (req, res) => {
  try {
    const userId = req.user.id_user;
    const db = require("../config/db");

    // Cambiar estado a inactive en lugar de eliminar
    await db.query("UPDATE users SET status_user = ? WHERE id_user = ?", [
      "inactive",
      userId,
    ]);

    // Revocar todas las sesiones del usuario
    await db.query(
      "UPDATE refresh_tokens SET is_revoked_refresh_token = 1 WHERE id_user = ?",
      [userId]
    );

    res.json({
      success: true,
      message: "Cuenta desactivada exitosamente",
      data: {
        id_user: userId,
        action: "account_deactivated",
        deactivated_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error desactivando cuenta:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

module.exports = router;
