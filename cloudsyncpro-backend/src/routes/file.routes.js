// routes/file.routes.js
const express = require("express");
const router = express.Router();
const { body, param, query } = require("express-validator");
const fileController = require("../controllers/file.controller");
const verifyToken = require("../middlewares/auth.middleware");
const { requireUser } = require("../middlewares/roleAuth.middleware");
const { upload, handleMulterError } = require("../config/multer");

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);
router.use(requireUser);

/**
 * POST /api/files/upload
 * Subir uno o múltiples archivos
 */
router.post(
  "/upload",
  // Multer middleware para manejar archivos
  upload.array("files", 10), // Máximo 10 archivos, campo 'files'
  // Middleware de manejo de errores de multer
  handleMulterError,
  // Validaciones adicionales
  [
    body("folder_id")
      .optional()
      .custom((value) => {
        // Permitir null, undefined, 'null' y números válidos
        if (value === null || value === undefined || value === "null") {
          return true;
        }
        const numValue = Number(value);
        if (!Number.isInteger(numValue) || numValue < 1) {
          throw new Error(
            "El ID de la carpeta debe ser un número válido o null"
          );
        }
        return true;
      }),
  ],
  fileController.uploadFiles
);

/**
 * GET /api/files
 * Obtener archivos del usuario con filtros opcionales
 */
router.get(
  "/",
  [
    query("folder_id")
      .optional()
      .custom((value) => {
        if (value === "null" || value === null || value === undefined) {
          return true;
        }
        return Number.isInteger(Number(value)) && Number(value) > 0;
      })
      .withMessage("ID de carpeta inválido"),
    query("search")
      .optional()
      .isLength({ max: 100 })
      .withMessage("La búsqueda no puede exceder 100 caracteres"),
    query("category")
      .optional()
      .isIn(["image", "pdf", "word", "excel", "powerpoint", ""])
      .withMessage("Categoría inválida"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("La página debe ser un número entero mayor a 0"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("El límite debe estar entre 1 y 100"),
  ],
  fileController.getFiles
);

/**
 * GET /api/files/:id
 * Obtener un archivo específico por ID
 */
router.get(
  "/:id",
  [param("id").isNumeric().withMessage("El ID del archivo debe ser numérico")],
  fileController.getFileById
);

/**
 * GET /api/files/:id/download
 * Descargar un archivo
 */
router.get(
  "/:id/download",
  [param("id").isNumeric().withMessage("El ID del archivo debe ser numérico")],
  fileController.downloadFile
);

/**
 * PUT /api/files/:id
 * Actualizar información de un archivo (solo nombre)
 */
router.put(
  "/:id",
  [
    param("id").isNumeric().withMessage("El ID del archivo debe ser numérico"),
    body("name_file")
      .notEmpty()
      .withMessage("El nombre del archivo es obligatorio")
      .isLength({ min: 1, max: 255 })
      .withMessage("El nombre debe tener entre 1 y 255 caracteres")
      .custom((value) => {
        // Verificar caracteres no válidos para nombres de archivo
        const invalidChars = /[\/\\:*?"<>|]/;
        if (invalidChars.test(value)) {
          throw new Error("El nombre contiene caracteres no válidos");
        }
        return true;
      }),
  ],
  fileController.updateFile
);

/**
 * DELETE /api/files/:id
 * Eliminar un archivo
 */
router.delete(
  "/:id",
  [param("id").isNumeric().withMessage("El ID del archivo debe ser numérico")],
  fileController.deleteFile
);

/**
 * PUT /api/files/:id/move
 * Mover un archivo a otra carpeta
 */
router.put(
  "/:id/move",
  [
    param("id").isNumeric().withMessage("El ID del archivo debe ser numérico"),
    body("new_folder_id")
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === "null") {
          return true;
        }
        if (!Number.isInteger(Number(value)) || Number(value) < 1) {
          throw new Error(
            "El ID de la nueva carpeta debe ser un número válido o null"
          );
        }
        return true;
      }),
  ],
  fileController.moveFile
);

/**
 * GET /api/files/search
 * Buscar archivos por nombre
 */
router.get(
  "/search",
  [
    query("query")
      .notEmpty()
      .withMessage("El término de búsqueda es obligatorio")
      .isLength({ min: 2, max: 100 })
      .withMessage("La búsqueda debe tener entre 2 y 100 caracteres"),
    query("category")
      .optional()
      .isIn(["image", "pdf", "word", "excel", "powerpoint", ""])
      .withMessage("Categoría inválida"),
    query("folder_id")
      .optional()
      .custom((value) => {
        if (value === "null" || value === null || value === undefined) {
          return true;
        }
        return Number.isInteger(Number(value)) && Number(value) > 0;
      })
      .withMessage("ID de carpeta inválido"),
  ],
  fileController.searchFiles
);

/**
 * GET /api/files/stats/user
 * Obtener estadísticas de archivos del usuario
 */
router.get("/stats/user", fileController.getFileStats);

module.exports = router;
