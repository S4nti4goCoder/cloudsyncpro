// routes/folder.routes.js
const express = require("express");
const router = express.Router();
const { body, param, query } = require("express-validator");
const folderController = require("../controllers/folder.controller");
const verifyToken = require("../middlewares/auth.middleware");
const { requireUser } = require("../middlewares/roleAuth.middleware");

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);
router.use(requireUser); // Solo usuarios autenticados (user o admin)

// ===========================
// RUTAS BÁSICAS DE CARPETAS
// ===========================

/**
 * GET /api/folders
 * Obtener carpetas del usuario con filtros opcionales
 * Query params: parent_id, search
 */
router.get(
  "/",
  [
    query("parent_id")
      .optional()
      .isNumeric()
      .withMessage("El ID de la carpeta padre debe ser numérico"),
    query("search")
      .optional()
      .isLength({ max: 100 })
      .withMessage("La búsqueda no puede exceder 100 caracteres"),
  ],
  folderController.getFolders
);

/**
 * GET /api/folders/:id
 * Obtener una carpeta específica por ID
 */
router.get(
  "/:id",
  [
    param("id")
      .isNumeric()
      .withMessage("El ID de la carpeta debe ser numérico"),
  ],
  folderController.getFolderById
);

/**
 * POST /api/folders
 * Crear una nueva carpeta
 */
router.post(
  "/",
  [
    body("name_folder")
      .notEmpty()
      .withMessage("El nombre de la carpeta es obligatorio")
      .isLength({ min: 1, max: 100 })
      .withMessage("El nombre debe tener entre 1 y 100 caracteres")
      .matches(/^[^\/\\:*?"<>|]+$/)
      .withMessage("El nombre contiene caracteres no válidos"),
    body("parent_folder_id")
      .optional()
      .isNumeric()
      .withMessage("El ID de la carpeta padre debe ser numérico"),
  ],
  folderController.createFolder
);

/**
 * PUT /api/folders/:id
 * Actualizar una carpeta existente
 */
router.put(
  "/:id",
  [
    param("id")
      .isNumeric()
      .withMessage("El ID de la carpeta debe ser numérico"),
    body("name_folder")
      .notEmpty()
      .withMessage("El nombre de la carpeta es obligatorio")
      .isLength({ min: 1, max: 100 })
      .withMessage("El nombre debe tener entre 1 y 100 caracteres")
      .matches(/^[^\/\\:*?"<>|]+$/)
      .withMessage("El nombre contiene caracteres no válidos"),
  ],
  folderController.updateFolder
);

/**
 * DELETE /api/folders/:id
 * Eliminar una carpeta (debe estar vacía)
 */
router.delete(
  "/:id",
  [
    param("id")
      .isNumeric()
      .withMessage("El ID de la carpeta debe ser numérico"),
  ],
  folderController.deleteFolder
);

// ===========================
// RUTAS AVANZADAS DE CARPETAS
// ===========================

/**
 * PUT /api/folders/:id/move
 * Mover una carpeta a otro padre
 */
router.put(
  "/:id/move",
  [
    param("id")
      .isNumeric()
      .withMessage("El ID de la carpeta debe ser numérico"),
    body("new_parent_id")
      .optional()
      .isNumeric()
      .withMessage("El ID del nuevo padre debe ser numérico"),
  ],
  folderController.moveFolder
);

/**
 * GET /api/folders/:id/path
 * Obtener la ruta completa de una carpeta (breadcrumbs)
 */
router.get(
  "/:id/path",
  [
    param("id")
      .isNumeric()
      .withMessage("El ID de la carpeta debe ser numérico"),
  ],
  folderController.getFolderPath
);

/**
 * GET /api/folders/:id/stats
 * Obtener estadísticas de una carpeta
 */
router.get(
  "/:id/stats",
  [
    param("id")
      .isNumeric()
      .withMessage("El ID de la carpeta debe ser numérico"),
  ],
  folderController.getFolderStats
);

/**
 * GET /api/folders/search
 * Buscar carpetas por nombre
 */
router.get(
  "/search",
  [
    query("query")
      .notEmpty()
      .withMessage("El término de búsqueda es obligatorio")
      .isLength({ min: 2, max: 100 })
      .withMessage("La búsqueda debe tener entre 2 y 100 caracteres"),
    query("parent_id")
      .optional()
      .isNumeric()
      .withMessage("El ID de la carpeta padre debe ser numérico"),
  ],
  folderController.searchFolders
);

/**
 * POST /api/folders/:id/duplicate
 * Duplicar una carpeta
 */
router.post(
  "/:id/duplicate",
  [
    param("id")
      .isNumeric()
      .withMessage("El ID de la carpeta debe ser numérico"),
    body("new_name")
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage("El nombre debe tener entre 1 y 100 caracteres")
      .matches(/^[^\/\\:*?"<>|]+$/)
      .withMessage("El nombre contiene caracteres no válidos"),
  ],
  folderController.duplicateFolder
);

// ===========================
// RUTAS DE ADMINISTRACIÓN
// ===========================

/**
 * GET /api/folders/admin/all
 * [ADMIN] Obtener todas las carpetas del sistema
 */
router.get(
  "/admin/all",
  require("../middlewares/roleAuth.middleware").requireAdminOnly,
  [
    query("page")
      .optional()
      .isNumeric()
      .withMessage("La página debe ser numérica"),
    query("limit")
      .optional()
      .isNumeric()
      .withMessage("El límite debe ser numérico"),
    query("search")
      .optional()
      .isLength({ max: 100 })
      .withMessage("La búsqueda no puede exceder 100 caracteres"),
    query("owner_id")
      .optional()
      .isNumeric()
      .withMessage("El ID del propietario debe ser numérico"),
  ],
  async (req, res) => {
    try {
      const { page = 1, limit = 20, search = "", owner_id = null } = req.query;

      const folderService = require("../services/folder.service");

      // Para admin, obtenemos todas las carpetas
      let whereClause = "WHERE 1=1";
      let params = [];

      if (search.trim()) {
        whereClause += " AND name_folder LIKE ?";
        params.push(`%${search}%`);
      }

      if (owner_id) {
        whereClause += " AND owner_user_id = ?";
        params.push(owner_id);
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const db = require("../config/db");
      const [folders] = await db.query(
        `
        SELECT 
          f.id_folder,
          f.name_folder,
          f.parent_folder_id,
          f.owner_user_id,
          f.created_at_folder,
          u.name_user as owner_name,
          u.email_user as owner_email,
          (SELECT COUNT(*) FROM folders WHERE parent_folder_id = f.id_folder) as subfolders_count,
          (SELECT COUNT(*) FROM files WHERE folder_id = f.id_folder) as files_count
        FROM folders f
        LEFT JOIN users u ON f.owner_user_id = u.id_user
        ${whereClause}
        ORDER BY f.created_at_folder DESC
        LIMIT ? OFFSET ?
      `,
        [...params, parseInt(limit), offset]
      );

      const [totalCount] = await db.query(
        `SELECT COUNT(*) as total FROM folders f ${whereClause}`,
        params
      );

      const total = totalCount[0].total;
      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        message: "Carpetas obtenidas exitosamente",
        data: folders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalFolders: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
      });
    } catch (error) {
      console.error("Error obteniendo todas las carpetas:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * DELETE /api/folders/admin/:id/force
 * [ADMIN] Eliminar una carpeta forzosamente (incluso con contenido)
 */
router.delete(
  "/admin/:id/force",
  require("../middlewares/roleAuth.middleware").requireAdminOnly,
  [
    param("id")
      .isNumeric()
      .withMessage("El ID de la carpeta debe ser numérico"),
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const db = require("../config/db");

      // Eliminar recursivamente todos los archivos y subcarpetas
      const deleteRecursive = async (folderId) => {
        // Obtener subcarpetas
        const [subfolders] = await db.query(
          "SELECT id_folder FROM folders WHERE parent_folder_id = ?",
          [folderId]
        );

        // Eliminar subcarpetas recursivamente
        for (const subfolder of subfolders) {
          await deleteRecursive(subfolder.id_folder);
        }

        // Eliminar archivos de esta carpeta
        await db.query("DELETE FROM files WHERE folder_id = ?", [folderId]);

        // Eliminar la carpeta
        await db.query("DELETE FROM folders WHERE id_folder = ?", [folderId]);
      };

      await deleteRecursive(parseInt(id));

      res.json({
        success: true,
        message: "Carpeta eliminada forzosamente",
        data: { deleted_folder_id: parseInt(id) },
      });
    } catch (error) {
      console.error("Error eliminando carpeta forzosamente:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
);

// ===========================
// MIDDLEWARE DE VALIDACIÓN PERSONALIZADA
// ===========================

/**
 * Validador personalizado para nombres de carpetas
 */
const validateFolderName = (value) => {
  // Lista de nombres reservados
  const reservedNames = [
    "CON",
    "PRN",
    "AUX",
    "NUL",
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "LPT1",
    "LPT2",
    "LPT3",
    "LPT4",
    "LPT5",
    "LPT6",
    "LPT7",
    "LPT8",
    "LPT9",
  ];

  if (reservedNames.includes(value.toUpperCase())) {
    throw new Error("Este nombre está reservado por el sistema");
  }

  // No puede empezar o terminar con espacios o puntos
  if (
    value.startsWith(" ") ||
    value.endsWith(" ") ||
    value.startsWith(".") ||
    value.endsWith(".")
  ) {
    throw new Error(
      "El nombre no puede empezar o terminar con espacios o puntos"
    );
  }

  return true;
};

// Exportar validador para uso en otras rutas si es necesario
router.validateFolderName = validateFolderName;

module.exports = router;
