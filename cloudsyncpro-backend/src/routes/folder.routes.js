// routes/folder.routes.js - CORRECCIONES APLICADAS
const express = require("express");
const router = express.Router();
const { body, param, query } = require("express-validator");
const folderController = require("../controllers/folder.controller");
const verifyToken = require("../middlewares/auth.middleware");
const { requireUser } = require("../middlewares/roleAuth.middleware");

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);
router.use(requireUser);

/**
 * POST /api/folders
 * Crear una nueva carpeta - VALIDACIÓN CORREGIDA
 */
router.post(
  "/",
  [
    body("name_folder")
      .notEmpty()
      .withMessage("El nombre de la carpeta es obligatorio")
      .isLength({ min: 1, max: 100 })
      .withMessage("El nombre debe tener entre 1 y 100 caracteres")
      .custom((value) => {
        const invalidChars = /[\/\\:*?"<>|]/;
        if (invalidChars.test(value)) {
          throw new Error("El nombre contiene caracteres no válidos");
        }
        return true;
      }),
    // ✅ CORRECCIÓN PRINCIPAL: Validación de parent_folder_id
    body("parent_folder_id")
      .optional()
      .custom((value) => {
        // Permitir explícitamente null y undefined
        if (value === null || value === undefined) {
          return true;
        }

        // Convertir a número y validar
        const numValue = Number(value);
        if (!Number.isInteger(numValue) || numValue < 1) {
          throw new Error(
            "El ID de la carpeta padre debe ser un número válido o null"
          );
        }
        return true;
      }),
  ],
  folderController.createFolder
);

// Resto de rutas sin cambios...
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

router.get(
  "/:id",
  [
    param("id")
      .isNumeric()
      .withMessage("El ID de la carpeta debe ser numérico"),
  ],
  folderController.getFolderById
);

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

router.delete(
  "/:id",
  [
    param("id")
      .isNumeric()
      .withMessage("El ID de la carpeta debe ser numérico"),
  ],
  folderController.deleteFolder
);

// Rutas avanzadas
router.put(
  "/:id/move",
  [
    param("id")
      .isNumeric()
      .withMessage("El ID de la carpeta debe ser numérico"),
    body("new_parent_id")
      .optional()
      .custom((value) => {
        if (value === null || value === undefined) {
          return true;
        }
        if (!Number.isInteger(Number(value)) || Number(value) < 1) {
          throw new Error(
            "El ID del nuevo padre debe ser un número válido o null"
          );
        }
        return true;
      }),
  ],
  folderController.moveFolder
);

router.get(
  "/:id/path",
  [
    param("id")
      .isNumeric()
      .withMessage("El ID de la carpeta debe ser numérico"),
  ],
  folderController.getFolderPath
);

router.get(
  "/:id/stats",
  [
    param("id")
      .isNumeric()
      .withMessage("El ID de la carpeta debe ser numérico"),
  ],
  folderController.getFolderStats
);

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

module.exports = router;
