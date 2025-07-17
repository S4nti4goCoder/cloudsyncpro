// controllers/file.controller.js
const { validationResult } = require("express-validator");
const fileService = require("../services/file.service");
const { getFileCategory, formatFileSize } = require("../config/multer");
const { isOwnerOrAdmin } = require("../middlewares/roleAuth.middleware");
const path = require("path");
const fs = require("fs");

const fileController = {
  // Subir uno o múltiples archivos
  uploadFiles: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: errors.array(),
        });
      }

      const userId = req.user.id_user;
      const userRole = req.user.role_user;
      const { folder_id } = req.body;

      // Verificar que se subieron archivos
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No se encontraron archivos para subir",
        });
      }

      // Normalizar folder_id
      const normalizedFolderId =
        folder_id && folder_id !== "null" ? parseInt(folder_id) : null;

      // Procesar cada archivo
      const uploadedFiles = [];
      const errorsList = [];

      for (const file of req.files) {
        try {
          const fileData = {
            name_file: file.originalname,
            file_path: file.path,
            file_url: `/uploads/${path.basename(path.dirname(file.path))}/${
              file.filename
            }`,
            type_file: file.mimetype,
            size_file: file.size,
            category_file: getFileCategory(file.mimetype),
            folder_id: normalizedFolderId,
            owner_user_id: userId,
          };

          const result = await fileService.createFile(
            fileData,
            userId,
            userRole
          );

          if (result.success) {
            uploadedFiles.push(result.data);
          } else {
            errorsList.push({
              filename: file.originalname,
              error: result.message,
            });
          }
        } catch (error) {
          console.error(
            `Error procesando archivo ${file.originalname}:`,
            error
          );
          errorsList.push({
            filename: file.originalname,
            error: "Error interno al procesar archivo",
          });
        }
      }

      // Respuesta basada en resultados
      if (uploadedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No se pudo subir ningún archivo",
          errors: errorsList,
        });
      }

      const response = {
        success: true,
        message: `${uploadedFiles.length} archivo(s) subido(s) exitosamente`,
        data: {
          uploaded: uploadedFiles,
          total: req.files.length,
          successful: uploadedFiles.length,
          failed: errorsList.length,
        },
      };

      if (errorsList.length > 0) {
        response.warnings = errorsList;
        response.message += ` (${errorsList.length} falló(s))`;
      }

      res.status(201).json(response);
    } catch (error) {
      console.error("Error en uploadFiles:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Obtener archivos del usuario
  getFiles: async (req, res) => {
    try {
      const userId = req.user.id_user;
      const userRole = req.user.role_user;
      const {
        folder_id = null,
        search = "",
        category = "",
        page = 1,
        limit = 20,
      } = req.query;

      const files = await fileService.getUserFiles(userId, userRole, {
        folder_id: folder_id === "null" ? null : folder_id,
        search,
        category,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.json({
        success: true,
        message: "Archivos obtenidos exitosamente",
        data: files.data || [],
        pagination: files.pagination,
      });
    } catch (error) {
      console.error("Error obteniendo archivos:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Obtener un archivo específico
  getFileById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      const file = await fileService.getFileById(id, userId, userRole);

      if (!file.success) {
        return res.status(404).json({
          success: false,
          message: file.message || "Archivo no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Archivo obtenido exitosamente",
        data: file.data,
      });
    } catch (error) {
      console.error("Error obteniendo archivo:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Descargar archivo
  downloadFile: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      const fileResult = await fileService.getFileById(id, userId, userRole);

      if (!fileResult.success) {
        return res.status(404).json({
          success: false,
          message: "Archivo no encontrado",
        });
      }

      const file = fileResult.data;
      const filePath = path.join(__dirname, "../../", file.file_path);

      // Verificar que el archivo existe físicamente
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "El archivo físico no se encuentra en el servidor",
        });
      }

      // Registrar descarga (opcional para estadísticas)
      await fileService.registerDownload(id, userId);

      // Configurar headers para descarga
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.name_file}"`
      );
      res.setHeader("Content-Type", file.type_file);
      res.setHeader("Content-Length", file.size_file);

      // Enviar archivo
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error descargando archivo:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Actualizar información del archivo
  updateFile: async (req, res) => {
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
      const { name_file } = req.body;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      const result = await fileService.updateFile(
        id,
        { name_file: name_file.trim() },
        userId,
        userRole
      );

      if (!result.success) {
        return res.status(result.code || 400).json({
          success: false,
          message: result.message,
        });
      }

      res.json({
        success: true,
        message: "Archivo actualizado exitosamente",
        data: result.data,
      });
    } catch (error) {
      console.error("Error actualizando archivo:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Eliminar archivo
  deleteFile: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      const result = await fileService.deleteFile(id, userId, userRole);

      if (!result.success) {
        return res.status(result.code || 400).json({
          success: false,
          message: result.message,
        });
      }

      res.json({
        success: true,
        message: "Archivo eliminado exitosamente",
        data: result.data,
      });
    } catch (error) {
      console.error("Error eliminando archivo:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Mover archivo a otra carpeta
  moveFile: async (req, res) => {
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
      const { new_folder_id } = req.body;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      const normalizedFolderId =
        new_folder_id && new_folder_id !== "null"
          ? parseInt(new_folder_id)
          : null;

      const result = await fileService.moveFile(
        id,
        normalizedFolderId,
        userId,
        userRole
      );

      if (!result.success) {
        return res.status(result.code || 400).json({
          success: false,
          message: result.message,
        });
      }

      res.json({
        success: true,
        message: "Archivo movido exitosamente",
        data: result.data,
      });
    } catch (error) {
      console.error("Error moviendo archivo:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Buscar archivos
  searchFiles: async (req, res) => {
    try {
      const { query, category = "", folder_id = null } = req.query;
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "La búsqueda debe tener al menos 2 caracteres",
        });
      }

      const results = await fileService.searchFiles(
        query.trim(),
        userId,
        userRole,
        {
          category,
          folder_id: folder_id === "null" ? null : folder_id,
        }
      );

      res.json({
        success: true,
        message: "Búsqueda completada",
        data: results.data || [],
      });
    } catch (error) {
      console.error("Error buscando archivos:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Obtener estadísticas de archivos del usuario
  getFileStats: async (req, res) => {
    try {
      const userId = req.user.id_user;
      const userRole = req.user.role_user;

      const stats = await fileService.getFileStats(userId, userRole);

      res.json({
        success: true,
        message: "Estadísticas obtenidas exitosamente",
        data: stats.data || {},
      });
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
};

module.exports = fileController;
