// services/file.service.js
const db = require("../config/db");
const {
  isAdmin,
  isOwnerOrAdmin,
} = require("../middlewares/roleAuth.middleware");
const path = require("path");
const fs = require("fs");

const fileService = {
  // Crear nuevo archivo en la base de datos
  createFile: async (fileData, userId, userRole) => {
    try {
      const {
        name_file,
        file_path,
        file_url,
        type_file,
        size_file,
        category_file,
        folder_id,
        owner_user_id,
      } = fileData;

      // Verificar que la carpeta padre existe (si se especifica)
      if (folder_id) {
        const [folderCheck] = await db.query(
          "SELECT id_folder, owner_user_id FROM folders WHERE id_folder = ?",
          [folder_id]
        );

        if (folderCheck.length === 0) {
          return {
            success: false,
            message: "La carpeta especificada no existe",
            code: 404,
          };
        }

        // Verificar permisos sobre la carpeta
        if (
          !isOwnerOrAdmin(
            { id_user: userId, role_user: userRole },
            folderCheck[0].owner_user_id
          )
        ) {
          return {
            success: false,
            message: "No tienes permisos para subir archivos a esta carpeta",
            code: 403,
          };
        }
      }

      // Insertar archivo en la base de datos
      const [result] = await db.query(
        `INSERT INTO files (
          name_file, 
          url_file, 
          file_path, 
          type_file, 
          size_file, 
          category_file, 
          folder_id, 
          owner_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name_file,
          file_url,
          file_path,
          type_file,
          size_file,
          category_file,
          folder_id,
          owner_user_id,
        ]
      );

      // Obtener el archivo creado con información completa
      const newFile = await fileService.getFileById(
        result.insertId,
        userId,
        userRole
      );

      return {
        success: true,
        data: newFile.data,
        message: "Archivo guardado exitosamente",
      };
    } catch (error) {
      console.error("Error creando archivo:", error);
      return {
        success: false,
        message: "Error al guardar archivo en la base de datos",
        code: 500,
      };
    }
  },

  // Obtener archivos del usuario con filtros
  getUserFiles: async (userId, userRole, options = {}) => {
    try {
      const {
        folder_id = null,
        search = "",
        category = "",
        page = 1,
        limit = 20,
      } = options;

      const offset = (page - 1) * limit;
      let whereConditions = [];
      let queryParams = [];

      // Filtro por propietario (solo admin puede ver todos)
      if (!isAdmin({ role_user: userRole })) {
        whereConditions.push("f.owner_user_id = ?");
        queryParams.push(userId);
      }

      // Filtro por carpeta
      if (folder_id !== null) {
        whereConditions.push("f.folder_id = ?");
        queryParams.push(folder_id);
      } else {
        whereConditions.push("f.folder_id IS NULL");
      }

      // Filtro por búsqueda
      if (search.trim()) {
        whereConditions.push("f.name_file LIKE ?");
        queryParams.push(`%${search}%`);
      }

      // Filtro por categoría
      if (category.trim()) {
        whereConditions.push("f.category_file = ?");
        queryParams.push(category);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Consulta principal
      const [files] = await db.query(
        `SELECT 
          f.id_file,
          f.name_file,
          f.url_file,
          f.file_path,
          f.type_file,
          f.size_file,
          f.category_file,
          f.folder_id,
          f.owner_user_id,
          f.created_at_file,
          u.name_user as owner_name,
          fo.name_folder as folder_name
        FROM files f
        LEFT JOIN users u ON f.owner_user_id = u.id_user
        LEFT JOIN folders fo ON f.folder_id = fo.id_folder
        ${whereClause}
        ORDER BY f.created_at_file DESC
        LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      // Contar total para paginación
      const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM files f ${whereClause}`,
        queryParams
      );

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: files,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error obteniendo archivos:", error);
      return {
        success: false,
        message: "Error al obtener archivos",
        data: [],
        code: 500,
      };
    }
  },

  // Obtener archivo por ID
  getFileById: async (fileId, userId, userRole) => {
    try {
      const [files] = await db.query(
        `SELECT 
          f.id_file,
          f.name_file,
          f.url_file,
          f.file_path,
          f.type_file,
          f.size_file,
          f.category_file,
          f.folder_id,
          f.owner_user_id,
          f.created_at_file,
          u.name_user as owner_name,
          u.email_user as owner_email,
          fo.name_folder as folder_name
        FROM files f
        LEFT JOIN users u ON f.owner_user_id = u.id_user
        LEFT JOIN folders fo ON f.folder_id = fo.id_folder
        WHERE f.id_file = ?`,
        [fileId]
      );

      if (files.length === 0) {
        return {
          success: false,
          message: "Archivo no encontrado",
          code: 404,
        };
      }

      const file = files[0];

      // Verificar permisos
      if (
        !isOwnerOrAdmin(
          { id_user: userId, role_user: userRole },
          file.owner_user_id
        )
      ) {
        return {
          success: false,
          message: "No tienes permisos para acceder a este archivo",
          code: 403,
        };
      }

      return {
        success: true,
        data: file,
      };
    } catch (error) {
      console.error("Error obteniendo archivo por ID:", error);
      return {
        success: false,
        message: "Error al obtener archivo",
        code: 500,
      };
    }
  },

  // Actualizar archivo
  updateFile: async (fileId, updateData, userId, userRole) => {
    try {
      const { name_file } = updateData;

      // Verificar que el archivo existe y el usuario tiene permisos
      const fileResult = await fileService.getFileById(
        fileId,
        userId,
        userRole
      );
      if (!fileResult.success) {
        return fileResult;
      }

      const file = fileResult.data;

      // Solo el propietario o admin pueden editar
      if (
        !isOwnerOrAdmin(
          { id_user: userId, role_user: userRole },
          file.owner_user_id
        )
      ) {
        return {
          success: false,
          message: "No tienes permisos para editar este archivo",
          code: 403,
        };
      }

      // Actualizar el archivo
      await db.query("UPDATE files SET name_file = ? WHERE id_file = ?", [
        name_file.trim(),
        fileId,
      ]);

      // Retornar archivo actualizado
      const updatedFile = await fileService.getFileById(
        fileId,
        userId,
        userRole
      );
      return {
        success: true,
        data: updatedFile.data,
        message: "Archivo actualizado exitosamente",
      };
    } catch (error) {
      console.error("Error actualizando archivo:", error);
      return {
        success: false,
        message: "Error al actualizar archivo",
        code: 500,
      };
    }
  },

  // Eliminar archivo
  deleteFile: async (fileId, userId, userRole) => {
    try {
      // Verificar que el archivo existe y el usuario tiene permisos
      const fileResult = await fileService.getFileById(
        fileId,
        userId,
        userRole
      );
      if (!fileResult.success) {
        return fileResult;
      }

      const file = fileResult.data;

      // Solo el propietario o admin pueden eliminar
      if (
        !isOwnerOrAdmin(
          { id_user: userId, role_user: userRole },
          file.owner_user_id
        )
      ) {
        return {
          success: false,
          message: "No tienes permisos para eliminar este archivo",
          code: 403,
        };
      }

      // Eliminar archivo físico
      const filePath = path.join(__dirname, "../../", file.file_path);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error("Error eliminando archivo físico:", error);
          // Continuar con la eliminación de la base de datos aunque falle el archivo físico
        }
      }

      // Eliminar registro de la base de datos
      await db.query("DELETE FROM files WHERE id_file = ?", [fileId]);

      return {
        success: true,
        data: {
          id_file: fileId,
          name_file: file.name_file,
          deleted_at: new Date(),
          deleted_by: userId,
        },
        message: "Archivo eliminado exitosamente",
      };
    } catch (error) {
      console.error("Error eliminando archivo:", error);
      return {
        success: false,
        message: "Error al eliminar archivo",
        code: 500,
      };
    }
  },

  // Mover archivo a otra carpeta
  moveFile: async (fileId, newFolderId, userId, userRole) => {
    try {
      // Verificar que el archivo existe y el usuario tiene permisos
      const fileResult = await fileService.getFileById(
        fileId,
        userId,
        userRole
      );
      if (!fileResult.success) {
        return fileResult;
      }

      const file = fileResult.data;

      // Solo el propietario o admin pueden mover
      if (
        !isOwnerOrAdmin(
          { id_user: userId, role_user: userRole },
          file.owner_user_id
        )
      ) {
        return {
          success: false,
          message: "No tienes permisos para mover este archivo",
          code: 403,
        };
      }

      // Si se especifica carpeta de destino, verificar que existe y hay permisos
      if (newFolderId) {
        const [folderCheck] = await db.query(
          "SELECT id_folder, owner_user_id FROM folders WHERE id_folder = ?",
          [newFolderId]
        );

        if (folderCheck.length === 0) {
          return {
            success: false,
            message: "La carpeta de destino no existe",
            code: 404,
          };
        }

        // Verificar permisos sobre la carpeta de destino
        if (
          !isOwnerOrAdmin(
            { id_user: userId, role_user: userRole },
            folderCheck[0].owner_user_id
          )
        ) {
          return {
            success: false,
            message: "No tienes permisos para mover archivos a esta carpeta",
            code: 403,
          };
        }
      }

      // Mover el archivo
      await db.query("UPDATE files SET folder_id = ? WHERE id_file = ?", [
        newFolderId,
        fileId,
      ]);

      // Retornar archivo actualizado
      const movedFile = await fileService.getFileById(fileId, userId, userRole);
      return {
        success: true,
        data: movedFile.data,
        message: "Archivo movido exitosamente",
      };
    } catch (error) {
      console.error("Error moviendo archivo:", error);
      return {
        success: false,
        message: "Error al mover archivo",
        code: 500,
      };
    }
  },

  // Buscar archivos
  searchFiles: async (query, userId, userRole, options = {}) => {
    try {
      const { category = "", folder_id = null } = options;

      let whereConditions = [];
      let queryParams = [];

      // Filtro por propietario (solo admin puede ver todos)
      if (!isAdmin({ role_user: userRole })) {
        whereConditions.push("f.owner_user_id = ?");
        queryParams.push(userId);
      }

      // Filtro por búsqueda en nombre
      whereConditions.push("f.name_file LIKE ?");
      queryParams.push(`%${query}%`);

      // Filtro por categoría
      if (category.trim()) {
        whereConditions.push("f.category_file = ?");
        queryParams.push(category);
      }

      // Filtro por carpeta
      if (folder_id) {
        whereConditions.push("f.folder_id = ?");
        queryParams.push(folder_id);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      const [results] = await db.query(
        `SELECT 
          f.id_file,
          f.name_file,
          f.url_file,
          f.type_file,
          f.size_file,
          f.category_file,
          f.folder_id,
          f.owner_user_id,
          f.created_at_file,
          u.name_user as owner_name,
          fo.name_folder as folder_name
        FROM files f
        LEFT JOIN users u ON f.owner_user_id = u.id_user
        LEFT JOIN folders fo ON f.folder_id = fo.id_folder
        ${whereClause}
        ORDER BY f.created_at_file DESC
        LIMIT 50`,
        queryParams
      );

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      console.error("Error buscando archivos:", error);
      return {
        success: false,
        message: "Error al buscar archivos",
        data: [],
        code: 500,
      };
    }
  },

  // Obtener estadísticas de archivos
  getFileStats: async (userId, userRole) => {
    try {
      let whereClause = "";
      let queryParams = [];

      // Solo admin puede ver estadísticas globales
      if (!isAdmin({ role_user: userRole })) {
        whereClause = "WHERE owner_user_id = ?";
        queryParams.push(userId);
      }

      const [stats] = await db.query(
        `SELECT 
          COUNT(*) as total_files,
          SUM(size_file) as total_size,
          COUNT(CASE WHEN category_file = 'image' THEN 1 END) as images,
          COUNT(CASE WHEN category_file = 'pdf' THEN 1 END) as pdfs,
          COUNT(CASE WHEN category_file = 'word' THEN 1 END) as word_docs,
          COUNT(CASE WHEN category_file = 'excel' THEN 1 END) as excel_docs,
          COUNT(CASE WHEN category_file = 'powerpoint' THEN 1 END) as powerpoint_docs,
          COUNT(CASE WHEN created_at_file >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as files_this_week,
          COUNT(CASE WHEN created_at_file >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as files_this_month
        FROM files ${whereClause}`,
        queryParams
      );

      return {
        success: true,
        data: {
          total_files: stats[0].total_files || 0,
          total_size: stats[0].total_size || 0,
          total_size_formatted: fileService.formatFileSize(
            stats[0].total_size || 0
          ),
          by_category: {
            images: stats[0].images || 0,
            pdfs: stats[0].pdfs || 0,
            word_docs: stats[0].word_docs || 0,
            excel_docs: stats[0].excel_docs || 0,
            powerpoint_docs: stats[0].powerpoint_docs || 0,
          },
          recent: {
            files_this_week: stats[0].files_this_week || 0,
            files_this_month: stats[0].files_this_month || 0,
          },
        },
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas de archivos:", error);
      return {
        success: false,
        message: "Error al obtener estadísticas",
        data: {},
        code: 500,
      };
    }
  },

  // Registrar descarga (para estadísticas)
  registerDownload: async (fileId, userId) => {
    try {
      // Esta función puede expandirse en el futuro para llevar estadísticas de descargas
      // Por ahora solo registra la acción
      console.log(`Usuario ${userId} descargó archivo ${fileId}`);
      return { success: true };
    } catch (error) {
      console.error("Error registrando descarga:", error);
      return { success: false };
    }
  },

  // Formatear tamaño de archivo
  formatFileSize: (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Obtener extensión de archivo
  getFileExtension: (filename) => {
    return path.extname(filename).toLowerCase();
  },

  // Validar si un archivo es una imagen
  isImageFile: (mimetype) => {
    return mimetype.startsWith("image/");
  },

  // Obtener icono según tipo de archivo
  getFileIcon: (mimetype, category) => {
    const icons = {
      image: "🖼️",
      pdf: "📄",
      word: "📝",
      excel: "📊",
      powerpoint: "📽️",
    };
    return icons[category] || "📄";
  },
};

module.exports = fileService;
