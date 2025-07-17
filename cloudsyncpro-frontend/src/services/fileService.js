import api from "./api";

/**
 * Servicio para gestión de archivos en el frontend
 * Conecta con todos los endpoints del backend de archivos
 */
export const fileService = {
  // ===========================
  // OPERACIONES BÁSICAS CRUD
  // ===========================

  /**
   * Subir uno o múltiples archivos
   * @param {FileList|File[]} files - Archivos a subir
   * @param {number|null} folderId - ID de carpeta destino (null para raíz)
   * @param {Function} onProgress - Callback para progreso de subida
   * @returns {Promise<Object>} - Respuesta con archivos subidos
   */
  uploadFiles: async (files, folderId = null, onProgress = null) => {
    try {
      const formData = new FormData();

      // Convertir FileList a Array si es necesario
      const fileArray = Array.from(files);

      // Agregar cada archivo al FormData
      fileArray.forEach((file) => {
        formData.append("files", file);
      });

      // Agregar folder_id
      formData.append("folder_id", folderId || "null");

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      // Configurar callback de progreso si se proporciona
      if (onProgress && typeof onProgress === "function") {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        };
      }

      const response = await api.post("/files/upload", formData, config);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        warnings: response.data.warnings || [],
      };
    } catch (error) {
      console.error("Error subiendo archivos:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al subir archivos",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  /**
   * Obtener archivos con filtros opcionales
   * @param {Object} params - Parámetros de filtro
   * @param {number|null} params.folder_id - ID de carpeta
   * @param {string} params.search - Término de búsqueda
   * @param {string} params.category - Categoría de archivo
   * @param {number} params.page - Página actual
   * @param {number} params.limit - Elementos por página
   * @returns {Promise<Object>} - Respuesta con archivos
   */
  getFiles: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.folder_id !== undefined && params.folder_id !== null) {
        queryParams.append("folder_id", params.folder_id);
      }

      if (params.search && params.search.trim()) {
        queryParams.append("search", params.search.trim());
      }

      if (params.category && params.category.trim()) {
        queryParams.append("category", params.category.trim());
      }

      if (params.page) {
        queryParams.append("page", params.page);
      }

      if (params.limit) {
        queryParams.append("limit", params.limit);
      }

      const url = `/files${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);

      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error obteniendo archivos:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener archivos",
        data: [],
      };
    }
  },

  /**
   * Obtener un archivo específico por ID
   * @param {number} fileId - ID del archivo
   * @returns {Promise<Object>} - Respuesta con datos del archivo
   */
  getFileById: async (fileId) => {
    try {
      const response = await api.get(`/files/${fileId}`);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error obteniendo archivo:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener archivo",
        data: null,
      };
    }
  },

  /**
   * Descargar un archivo
   * @param {number} fileId - ID del archivo
   * @param {string} fileName - Nombre del archivo para la descarga
   * @returns {Promise<Object>} - Respuesta de descarga
   */
  downloadFile: async (fileId, fileName = "archivo") => {
    try {
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: "blob", // Importante para archivos binarios
      });

      // Crear URL del blob y descargar automáticamente
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: "Archivo descargado exitosamente",
      };
    } catch (error) {
      console.error("Error descargando archivo:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al descargar archivo",
      };
    }
  },

  /**
   * Actualizar nombre de archivo
   * @param {number} fileId - ID del archivo
   * @param {string} newName - Nuevo nombre del archivo
   * @returns {Promise<Object>} - Respuesta con archivo actualizado
   */
  updateFile: async (fileId, newName) => {
    try {
      const response = await api.put(`/files/${fileId}`, {
        name_file: newName,
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Archivo actualizado exitosamente",
      };
    } catch (error) {
      console.error("Error actualizando archivo:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar archivo",
        data: null,
      };
    }
  },

  /**
   * Eliminar un archivo
   * @param {number} fileId - ID del archivo
   * @returns {Promise<Object>} - Respuesta de eliminación
   */
  deleteFile: async (fileId) => {
    try {
      const response = await api.delete(`/files/${fileId}`);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Archivo eliminado exitosamente",
      };
    } catch (error) {
      console.error("Error eliminando archivo:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al eliminar archivo",
        data: null,
      };
    }
  },

  /**
   * Mover archivo a otra carpeta
   * @param {number} fileId - ID del archivo
   * @param {number|null} newFolderId - ID de la nueva carpeta (null para raíz)
   * @returns {Promise<Object>} - Respuesta con archivo movido
   */
  moveFile: async (fileId, newFolderId) => {
    try {
      const response = await api.put(`/files/${fileId}/move`, {
        new_folder_id: newFolderId,
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Archivo movido exitosamente",
      };
    } catch (error) {
      console.error("Error moviendo archivo:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al mover archivo",
        data: null,
      };
    }
  },

  /**
   * Buscar archivos por nombre
   * @param {Object} searchParams - Parámetros de búsqueda
   * @param {string} searchParams.query - Término de búsqueda
   * @param {string} searchParams.category - Categoría de archivo (opcional)
   * @param {number|null} searchParams.folder_id - ID de carpeta para buscar (opcional)
   * @returns {Promise<Object>} - Respuesta con resultados de búsqueda
   */
  searchFiles: async (searchParams) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("query", searchParams.query);

      if (searchParams.category && searchParams.category.trim()) {
        queryParams.append("category", searchParams.category);
      }

      if (
        searchParams.folder_id !== undefined &&
        searchParams.folder_id !== null
      ) {
        queryParams.append("folder_id", searchParams.folder_id);
      }

      const response = await api.get(`/files/search?${queryParams.toString()}`);

      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error buscando archivos:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al buscar archivos",
        data: [],
      };
    }
  },

  /**
   * Obtener estadísticas de archivos del usuario
   * @returns {Promise<Object>} - Respuesta con estadísticas
   */
  getFileStats: async () => {
    try {
      const response = await api.get("/files/stats/user");

      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al obtener estadísticas",
        data: {},
      };
    }
  },

  // ===========================
  // FUNCIONES DE UTILIDAD
  // ===========================

  /**
   * Validar tipos de archivo permitidos
   * @param {File} file - Archivo a validar
   * @returns {Object} - Resultado de validación
   */
  validateFileType: (file) => {
    const allowedTypes = {
      // Imágenes
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",

      // PDF
      "application/pdf": ".pdf",

      // Word
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",

      // Excel
      "application/vnd.ms-excel": ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        ".xlsx",

      // PowerPoint
      "application/vnd.ms-powerpoint": ".ppt",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        ".pptx",
    };

    const isValidType = allowedTypes.hasOwnProperty(file.type);
    const extension = allowedTypes[file.type];

    return {
      isValid: isValidType,
      extension: extension,
      category: fileService.getFileCategory(file.type),
      message: isValidType
        ? "Tipo de archivo válido"
        : "Tipo de archivo no permitido. Solo se permiten: PDF, Word, Excel, PowerPoint e imágenes.",
    };
  },

  /**
   * Validar tamaño de archivo
   * @param {File} file - Archivo a validar
   * @returns {Object} - Resultado de validación
   */
  validateFileSize: (file) => {
    const isImage = file.type.startsWith("image/");
    const maxSize = isImage ? 5 * 1024 * 1024 : 25 * 1024 * 1024; // 5MB para imágenes, 25MB para documentos
    const isValidSize = file.size <= maxSize;

    return {
      isValid: isValidSize,
      maxSize: maxSize,
      currentSize: file.size,
      message: isValidSize
        ? "Tamaño de archivo válido"
        : `Archivo demasiado grande. Máximo ${isImage ? "5MB" : "25MB"} para ${
            isImage ? "imágenes" : "documentos"
          }.`,
    };
  },

  /**
   * Obtener categoría de archivo basada en tipo MIME
   * @param {string} mimeType - Tipo MIME del archivo
   * @returns {string} - Categoría del archivo
   */
  getFileCategory: (mimeType) => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.includes("word")) return "word";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
      return "excel";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
      return "powerpoint";
    return "document";
  },

  /**
   * Formatear tamaño de archivo para mostrar
   * @param {number} bytes - Tamaño en bytes
   * @returns {string} - Tamaño formateado
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  /**
   * Obtener icono según categoría de archivo
   * @param {string} category - Categoría del archivo
   * @returns {string} - Emoji del icono
   */
  getFileIcon: (category) => {
    const icons = {
      image: "🖼️",
      pdf: "📄",
      word: "📝",
      excel: "📊",
      powerpoint: "📽️",
      document: "📄",
    };
    return icons[category] || "📄";
  },

  /**
   * Obtener color según categoría de archivo
   * @param {string} category - Categoría del archivo
   * @returns {string} - Clase CSS de color
   */
  getFileColor: (category) => {
    const colors = {
      image: "text-purple-600",
      pdf: "text-red-600",
      word: "text-blue-600",
      excel: "text-green-600",
      powerpoint: "text-orange-600",
      document: "text-gray-600",
    };
    return colors[category] || "text-gray-600";
  },
};

export default fileService;
