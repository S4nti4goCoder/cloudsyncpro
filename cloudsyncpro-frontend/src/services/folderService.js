import api from "./api";

/**
 * Servicio para gestión de carpetas
 * Conecta con todos los endpoints del backend de carpetas
 */
export const folderService = {
  // ===========================
  // OPERACIONES BÁSICAS CRUD
  // ===========================

  /**
   * Obtener carpetas del usuario con filtros opcionales
   * @param {Object} params - Parámetros de filtro
   * @param {number|null} params.parent_id - ID de carpeta padre (null para raíz)
   * @param {string} params.search - Término de búsqueda
   * @returns {Promise<Object>} - Respuesta con carpetas
   */
  getFolders: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.parent_id !== undefined && params.parent_id !== null) {
        queryParams.append("parent_id", params.parent_id);
      }

      if (params.search && params.search.trim()) {
        queryParams.append("search", params.search.trim());
      }

      const url = `/folders${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);

      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error obteniendo carpetas:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener carpetas",
        data: [],
      };
    }
  },

  /**
   * Obtener una carpeta específica por ID
   * @param {number} folderId - ID de la carpeta
   * @returns {Promise<Object>} - Respuesta con datos de la carpeta
   */
  getFolderById: async (folderId) => {
    try {
      const response = await api.get(`/folders/${folderId}`);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error obteniendo carpeta:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener carpeta",
        data: null,
      };
    }
  },

  /**
   * Crear una nueva carpeta
   * @param {Object} folderData - Datos de la carpeta
   * @param {string} folderData.name_folder - Nombre de la carpeta
   * @param {number|null} folderData.parent_folder_id - ID de carpeta padre
   * @returns {Promise<Object>} - Respuesta con carpeta creada
   */
  createFolder: async (folderData) => {
    try {
      const response = await api.post("/folders", {
        name_folder: folderData.name_folder,
        parent_folder_id: folderData.parent_folder_id || null,
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Carpeta creada exitosamente",
      };
    } catch (error) {
      console.error("Error creando carpeta:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear carpeta",
        data: null,
      };
    }
  },

  /**
   * Actualizar una carpeta existente
   * @param {number} folderId - ID de la carpeta
   * @param {Object} updateData - Datos a actualizar
   * @param {string} updateData.name_folder - Nuevo nombre de la carpeta
   * @returns {Promise<Object>} - Respuesta con carpeta actualizada
   */
  updateFolder: async (folderId, updateData) => {
    try {
      const response = await api.put(`/folders/${folderId}`, {
        name_folder: updateData.name_folder,
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Carpeta actualizada exitosamente",
      };
    } catch (error) {
      console.error("Error actualizando carpeta:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar carpeta",
        data: null,
      };
    }
  },

  /**
   * Eliminar una carpeta
   * @param {number} folderId - ID de la carpeta
   * @returns {Promise<Object>} - Respuesta de eliminación
   */
  deleteFolder: async (folderId) => {
    try {
      const response = await api.delete(`/folders/${folderId}`);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Carpeta eliminada exitosamente",
      };
    } catch (error) {
      console.error("Error eliminando carpeta:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al eliminar carpeta",
        data: null,
      };
    }
  },

  // ===========================
  // OPERACIONES AVANZADAS
  // ===========================

  /**
   * Mover una carpeta a otro padre
   * @param {number} folderId - ID de la carpeta a mover
   * @param {number|null} newParentId - ID del nuevo padre (null para raíz)
   * @returns {Promise<Object>} - Respuesta con carpeta movida
   */
  moveFolder: async (folderId, newParentId) => {
    try {
      const response = await api.put(`/folders/${folderId}/move`, {
        new_parent_id: newParentId,
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Carpeta movida exitosamente",
      };
    } catch (error) {
      console.error("Error moviendo carpeta:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al mover carpeta",
        data: null,
      };
    }
  },

  /**
   * Obtener la ruta completa de una carpeta (breadcrumbs)
   * @param {number} folderId - ID de la carpeta
   * @returns {Promise<Object>} - Respuesta con ruta de carpeta
   */
  getFolderPath: async (folderId) => {
    try {
      const response = await api.get(`/folders/${folderId}/path`);

      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error obteniendo ruta de carpeta:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener ruta",
        data: [],
      };
    }
  },

  /**
   * Obtener estadísticas de una carpeta
   * @param {number} folderId - ID de la carpeta
   * @returns {Promise<Object>} - Respuesta con estadísticas
   */
  getFolderStats: async (folderId) => {
    try {
      const response = await api.get(`/folders/${folderId}/stats`);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al obtener estadísticas",
        data: null,
      };
    }
  },

  /**
   * Buscar carpetas por nombre
   * @param {Object} searchParams - Parámetros de búsqueda
   * @param {string} searchParams.query - Término de búsqueda
   * @param {number|null} searchParams.parent_id - ID de carpeta padre para buscar
   * @returns {Promise<Object>} - Respuesta con resultados de búsqueda
   */
  searchFolders: async (searchParams) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("query", searchParams.query);

      if (
        searchParams.parent_id !== undefined &&
        searchParams.parent_id !== null
      ) {
        queryParams.append("parent_id", searchParams.parent_id);
      }

      const response = await api.get(
        `/folders/search?${queryParams.toString()}`
      );

      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error buscando carpetas:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al buscar carpetas",
        data: [],
      };
    }
  },

  /**
   * Duplicar una carpeta
   * @param {number} folderId - ID de la carpeta a duplicar
   * @param {string|null} newName - Nuevo nombre para la copia
   * @returns {Promise<Object>} - Respuesta con carpeta duplicada
   */
  duplicateFolder: async (folderId, newName = null) => {
    try {
      const requestData = {};
      if (newName && newName.trim()) {
        requestData.new_name = newName.trim();
      }

      const response = await api.post(
        `/folders/${folderId}/duplicate`,
        requestData
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Carpeta duplicada exitosamente",
      };
    } catch (error) {
      console.error("Error duplicando carpeta:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al duplicar carpeta",
        data: null,
      };
    }
  },

  // ===========================
  // FUNCIONES DE UTILIDAD
  // ===========================

  /**
   * Validar nombre de carpeta
   * @param {string} name - Nombre a validar
   * @returns {Object} - Resultado de validación
   */
  validateFolderName: (name) => {
    const errors = [];

    if (!name || !name.trim()) {
      errors.push("El nombre de la carpeta es obligatorio");
    } else {
      const trimmedName = name.trim();

      if (trimmedName.length < 1) {
        errors.push("El nombre debe tener al menos 1 carácter");
      }

      if (trimmedName.length > 100) {
        errors.push("El nombre no puede exceder 100 caracteres");
      }

      // Caracteres no válidos para nombres de carpetas
      const invalidChars = /[\/\\:*?"<>|]/;
      if (invalidChars.test(trimmedName)) {
        errors.push(
          'El nombre contiene caracteres no válidos (/ \\ : * ? " < > |)'
        );
      }

      // Nombres reservados
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

      if (reservedNames.includes(trimmedName.toUpperCase())) {
        errors.push("Este nombre está reservado por el sistema");
      }

      // No puede empezar o terminar con espacios o puntos
      if (
        trimmedName.startsWith(" ") ||
        trimmedName.endsWith(" ") ||
        trimmedName.startsWith(".") ||
        trimmedName.endsWith(".")
      ) {
        errors.push(
          "El nombre no puede empezar o terminar con espacios o puntos"
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedName: name ? name.trim() : "",
    };
  },

  /**
   * Formatear tamaño de carpeta para mostrar
   * @param {number} count - Número de elementos
   * @param {string} type - Tipo de elementos ('files' o 'folders')
   * @returns {string} - Texto formateado
   */
  formatFolderSize: (count, type = "items") => {
    if (!count || count === 0) {
      return type === "files"
        ? "Sin archivos"
        : type === "folders"
        ? "Sin subcarpetas"
        : "Vacía";
    }

    if (count === 1) {
      return type === "files"
        ? "1 archivo"
        : type === "folders"
        ? "1 subcarpeta"
        : "1 elemento";
    }

    return type === "files"
      ? `${count} archivos`
      : type === "folders"
      ? `${count} subcarpetas`
      : `${count} elementos`;
  },

  /**
   * Generar nombre único para carpeta duplicada
   * @param {string} originalName - Nombre original
   * @param {Array} existingNames - Lista de nombres existentes
   * @returns {string} - Nombre único generado
   */
  generateUniqueName: (originalName, existingNames = []) => {
    const baseName = originalName.trim();
    let counter = 1;
    let newName = `${baseName} - Copia`;

    while (existingNames.includes(newName)) {
      counter++;
      newName = `${baseName} - Copia (${counter})`;
    }

    return newName;
  },

  /**
   * Construir breadcrumbs navegables desde la ruta
   * @param {Array} pathArray - Array de ruta desde getFolderPath
   * @returns {Array} - Breadcrumbs navegables
   */
  buildBreadcrumbs: (pathArray = []) => {
    const breadcrumbs = [
      {
        id: null,
        name: "Inicio",
        level: -1,
        isRoot: true,
      },
    ];

    // Ordenar por nivel (del padre al hijo)
    const sortedPath = [...pathArray].sort(
      (a, b) => (b.level || 0) - (a.level || 0)
    );

    sortedPath.forEach((folder) => {
      breadcrumbs.push({
        id: folder.id_folder,
        name: folder.name_folder,
        level: folder.level || 0,
        isRoot: false,
      });
    });

    return breadcrumbs;
  },
};

export default folderService;
