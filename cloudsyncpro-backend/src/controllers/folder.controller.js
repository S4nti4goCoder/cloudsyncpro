// controllers/folder.controller.js - LOGS REMOVIDOS Y OPTIMIZADO
const { validationResult } = require("express-validator");
const folderService = require("../services/folder.service");
const { isOwnerOrAdmin } = require("../middlewares/roleAuth.middleware");

const folderController = {
  // Crear una nueva carpeta - VERSIÓN OPTIMIZADA
  createFolder: async (req, res) => {
    try {
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: errors.array(),
        });
      }

      const { name_folder, parent_folder_id = null } = req.body;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      // ✅ CORRECCIÓN: Normalizar parent_folder_id
      const normalizedParentId =
        parent_folder_id === null ||
        parent_folder_id === undefined ||
        parent_folder_id === ""
          ? null
          : parseInt(parent_folder_id);

      const newFolder = await folderService.createFolder(
        {
          name_folder: name_folder.trim(),
          parent_folder_id: normalizedParentId,
          owner_user_id: userId,
        },
        userId,
        userRole
      );

      res.status(201).json({
        success: true,
        message: "Carpeta creada exitosamente",
        data: newFolder,
      });
    } catch (error) {
      // Log solo en desarrollo
      if (process.env.NODE_ENV === "development") {
        console.error("Error al crear carpeta:", error);
      }

      if (
        error.message ===
        "Ya existe una carpeta con ese nombre en esta ubicación"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "La carpeta padre no existe o no tienes acceso") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Obtener todas las carpetas del usuario
  getFolders: async (req, res) => {
    try {
      const userId = req.user.id_user;
      const userRole = req.user.role_user;
      const { parent_id = null, search = "" } = req.query;

      const folders = await folderService.getUserFolders(
        userId,
        userRole,
        parent_id,
        search
      );

      res.json({
        success: true,
        message: "Carpetas obtenidas exitosamente",
        data: folders,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al obtener carpetas:", error);
      }
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Obtener una carpeta específica por ID
  getFolderById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      const folder = await folderService.getFolderById(id, userId, userRole);

      if (!folder) {
        return res.status(404).json({
          success: false,
          message: "Carpeta no encontrada",
        });
      }

      res.json({
        success: true,
        message: "Carpeta obtenida exitosamente",
        data: folder,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al obtener carpeta:", error);
      }

      if (error.message === "No tienes permisos para acceder a esta carpeta") {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Actualizar una carpeta
  updateFolder: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { name_folder } = req.body;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      const updatedFolder = await folderService.updateFolder(
        id,
        { name_folder: name_folder.trim() },
        userId,
        userRole
      );

      res.json({
        success: true,
        message: "Carpeta actualizada exitosamente",
        data: updatedFolder,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al actualizar carpeta:", error);
      }

      if (error.message === "Carpeta no encontrada") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "No tienes permisos para editar esta carpeta") {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "Ya existe una carpeta con ese nombre en esta ubicación"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Eliminar una carpeta
  deleteFolder: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      const result = await folderService.deleteFolder(id, userId, userRole);

      res.json({
        success: true,
        message: "Carpeta eliminada exitosamente",
        data: result,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al eliminar carpeta:", error);
      }

      if (error.message === "Carpeta no encontrada") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "No tienes permisos para eliminar esta carpeta") {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message ===
        "No puedes eliminar una carpeta que contiene archivos o subcarpetas"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Resto de métodos sin cambios importantes...
  moveFolder: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { new_parent_id } = req.body;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      const movedFolder = await folderService.moveFolder(
        id,
        new_parent_id,
        userId,
        userRole
      );

      res.json({
        success: true,
        message: "Carpeta movida exitosamente",
        data: movedFolder,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al mover carpeta:", error);
      }

      if (error.message === "Carpeta no encontrada") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "No tienes permisos para mover esta carpeta") {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "No puedes mover una carpeta dentro de sí misma") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message === "La carpeta de destino no existe o no tienes acceso"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message === "Ya existe una carpeta con ese nombre en el destino"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  getFolderPath: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      const path = await folderService.getFolderPath(id, userId, userRole);

      res.json({
        success: true,
        message: "Ruta de carpeta obtenida exitosamente",
        data: path,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al obtener ruta de carpeta:", error);
      }

      if (error.message === "Carpeta no encontrada") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "No tienes permisos para acceder a esta carpeta") {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  getFolderStats: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      const stats = await folderService.getFolderStats(id, userId, userRole);

      res.json({
        success: true,
        message: "Estadísticas de carpeta obtenidas exitosamente",
        data: stats,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al obtener estadísticas:", error);
      }

      if (error.message === "Carpeta no encontrada") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "No tienes permisos para acceder a esta carpeta") {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  searchFolders: async (req, res) => {
    try {
      const { query, parent_id = null } = req.query;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "La búsqueda debe tener al menos 2 caracteres",
        });
      }

      const results = await folderService.searchFolders(
        query.trim(),
        userId,
        userRole,
        parent_id
      );

      res.json({
        success: true,
        message: "Búsqueda completada",
        data: results,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al buscar carpetas:", error);
      }
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  duplicateFolder: async (req, res) => {
    try {
      const { id } = req.params;
      const { new_name = null } = req.body;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      const duplicatedFolder = await folderService.duplicateFolder(
        id,
        new_name,
        userId,
        userRole
      );

      res.status(201).json({
        success: true,
        message: "Carpeta duplicada exitosamente",
        data: duplicatedFolder,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al duplicar carpeta:", error);
      }

      if (error.message === "Carpeta no encontrada") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "No tienes permisos para duplicar esta carpeta") {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
};

module.exports = folderController;
