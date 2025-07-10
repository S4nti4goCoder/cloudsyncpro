// services/folder.service.js
const db = require("../config/db");
const {
  isAdmin,
  isOwnerOrAdmin,
} = require("../middlewares/roleAuth.middleware");

const folderService = {
  // Obtener carpetas del usuario con filtros
  getUserFolders: async (userId, userRole, parentId = null, search = "") => {
    try {
      let whereClause = "";
      let params = [];

      // Construir la consulta base según el rol
      if (isAdmin({ role_user: userRole })) {
        // Admin puede ver todas las carpetas
        whereClause = "WHERE parent_folder_id IS NULL";
        if (parentId) {
          whereClause = "WHERE parent_folder_id = ?";
          params.push(parentId);
        }
      } else {
        // Usuario normal solo ve sus carpetas
        whereClause = "WHERE owner_user_id = ? AND parent_folder_id IS NULL";
        params.push(userId);
        if (parentId) {
          whereClause = "WHERE owner_user_id = ? AND parent_folder_id = ?";
          params.push(parentId);
        }
      }

      // Agregar filtro de búsqueda si existe
      if (search.trim()) {
        whereClause += ` AND name_folder LIKE ?`;
        params.push(`%${search}%`);
      }

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
        ORDER BY f.name_folder ASC
      `,
        params
      );

      return folders;
    } catch (error) {
      console.error("Error obteniendo carpetas del usuario:", error);
      throw new Error("Error al obtener carpetas");
    }
  },

  // Obtener una carpeta específica por ID
  getFolderById: async (folderId, userId, userRole) => {
    try {
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
        WHERE f.id_folder = ?
      `,
        [folderId]
      );

      if (folders.length === 0) {
        return null;
      }

      const folder = folders[0];

      // Verificar permisos
      if (
        !isOwnerOrAdmin(
          { id_user: userId, role_user: userRole },
          folder.owner_user_id
        )
      ) {
        throw new Error("No tienes permisos para acceder a esta carpeta");
      }

      return folder;
    } catch (error) {
      if (error.message === "No tienes permisos para acceder a esta carpeta") {
        throw error;
      }
      console.error("Error obteniendo carpeta por ID:", error);
      throw new Error("Error al obtener carpeta");
    }
  },

  // Crear una nueva carpeta
  createFolder: async (folderData, userId, userRole) => {
    try {
      const { name_folder, parent_folder_id, owner_user_id } = folderData;

      // Verificar si la carpeta padre existe (si se especifica)
      if (parent_folder_id) {
        const parentFolder = await folderService.getFolderById(
          parent_folder_id,
          userId,
          userRole
        );
        if (!parentFolder) {
          throw new Error("La carpeta padre no existe o no tienes acceso");
        }
      }

      // Verificar que no exista otra carpeta con el mismo nombre en la misma ubicación
      const [existing] = await db.query(
        `
        SELECT id_folder FROM folders 
        WHERE name_folder = ? 
        AND parent_folder_id ${parent_folder_id ? "= ?" : "IS NULL"}
        AND owner_user_id = ?
      `,
        parent_folder_id
          ? [name_folder, parent_folder_id, owner_user_id]
          : [name_folder, owner_user_id]
      );

      if (existing.length > 0) {
        throw new Error(
          "Ya existe una carpeta con ese nombre en esta ubicación"
        );
      }

      // Crear la carpeta
      const [result] = await db.query(
        `
        INSERT INTO folders (name_folder, parent_folder_id, owner_user_id)
        VALUES (?, ?, ?)
      `,
        [name_folder, parent_folder_id, owner_user_id]
      );

      // Obtener la carpeta creada con todos los datos
      const newFolder = await folderService.getFolderById(
        result.insertId,
        userId,
        userRole
      );

      return newFolder;
    } catch (error) {
      if (
        error.message.includes("Ya existe una carpeta") ||
        error.message.includes("La carpeta padre no existe")
      ) {
        throw error;
      }
      console.error("Error creando carpeta:", error);
      throw new Error("Error al crear carpeta");
    }
  },

  // Actualizar una carpeta
  updateFolder: async (folderId, updateData, userId, userRole) => {
    try {
      const { name_folder } = updateData;

      // Verificar que la carpeta existe y el usuario tiene permisos
      const folder = await folderService.getFolderById(
        folderId,
        userId,
        userRole
      );
      if (!folder) {
        throw new Error("Carpeta no encontrada");
      }

      // Solo el propietario o admin pueden editar
      if (
        !isOwnerOrAdmin(
          { id_user: userId, role_user: userRole },
          folder.owner_user_id
        )
      ) {
        throw new Error("No tienes permisos para editar esta carpeta");
      }

      // Verificar que no exista otra carpeta con el mismo nombre en la misma ubicación
      const [existing] = await db.query(
        `
        SELECT id_folder FROM folders 
        WHERE name_folder = ? 
        AND parent_folder_id ${folder.parent_folder_id ? "= ?" : "IS NULL"}
        AND owner_user_id = ?
        AND id_folder != ?
      `,
        folder.parent_folder_id
          ? [
              name_folder,
              folder.parent_folder_id,
              folder.owner_user_id,
              folderId,
            ]
          : [name_folder, folder.owner_user_id, folderId]
      );

      if (existing.length > 0) {
        throw new Error(
          "Ya existe una carpeta con ese nombre en esta ubicación"
        );
      }

      // Actualizar la carpeta
      await db.query("UPDATE folders SET name_folder = ? WHERE id_folder = ?", [
        name_folder,
        folderId,
      ]);

      // Retornar la carpeta actualizada
      const updatedFolder = await folderService.getFolderById(
        folderId,
        userId,
        userRole
      );
      return updatedFolder;
    } catch (error) {
      if (
        error.message.includes("No tienes permisos") ||
        error.message.includes("Ya existe una carpeta") ||
        error.message === "Carpeta no encontrada"
      ) {
        throw error;
      }
      console.error("Error actualizando carpeta:", error);
      throw new Error("Error al actualizar carpeta");
    }
  },

  // Eliminar una carpeta
  deleteFolder: async (folderId, userId, userRole) => {
    try {
      // Verificar que la carpeta existe y el usuario tiene permisos
      const folder = await folderService.getFolderById(
        folderId,
        userId,
        userRole
      );
      if (!folder) {
        throw new Error("Carpeta no encontrada");
      }

      // Solo el propietario o admin pueden eliminar
      if (
        !isOwnerOrAdmin(
          { id_user: userId, role_user: userRole },
          folder.owner_user_id
        )
      ) {
        throw new Error("No tienes permisos para eliminar esta carpeta");
      }

      // Verificar que la carpeta esté vacía (sin subcarpetas ni archivos)
      const [subfolders] = await db.query(
        "SELECT id_folder FROM folders WHERE parent_folder_id = ?",
        [folderId]
      );

      const [files] = await db.query(
        "SELECT id_file FROM files WHERE folder_id = ?",
        [folderId]
      );

      if (subfolders.length > 0 || files.length > 0) {
        throw new Error(
          "No puedes eliminar una carpeta que contiene archivos o subcarpetas"
        );
      }

      // Eliminar la carpeta
      await db.query("DELETE FROM folders WHERE id_folder = ?", [folderId]);

      return {
        id_folder: folderId,
        name_folder: folder.name_folder,
        deleted_at: new Date(),
        deleted_by: userId,
      };
    } catch (error) {
      if (
        error.message.includes("No tienes permisos") ||
        error.message.includes("No puedes eliminar") ||
        error.message === "Carpeta no encontrada"
      ) {
        throw error;
      }
      console.error("Error eliminando carpeta:", error);
      throw new Error("Error al eliminar carpeta");
    }
  },

  // Mover una carpeta a otro padre
  moveFolder: async (folderId, newParentId, userId, userRole) => {
    try {
      // Verificar que la carpeta existe y el usuario tiene permisos
      const folder = await folderService.getFolderById(
        folderId,
        userId,
        userRole
      );
      if (!folder) {
        throw new Error("Carpeta no encontrada");
      }

      // Solo el propietario o admin pueden mover
      if (
        !isOwnerOrAdmin(
          { id_user: userId, role_user: userRole },
          folder.owner_user_id
        )
      ) {
        throw new Error("No tienes permisos para mover esta carpeta");
      }

      // Verificar que no se mueva dentro de sí misma
      if (newParentId && parseInt(newParentId) === parseInt(folderId)) {
        throw new Error("No puedes mover una carpeta dentro de sí misma");
      }

      // Si se especifica un nuevo padre, verificar que existe y el usuario tiene acceso
      if (newParentId) {
        const parentFolder = await folderService.getFolderById(
          newParentId,
          userId,
          userRole
        );
        if (!parentFolder) {
          throw new Error("La carpeta de destino no existe o no tienes acceso");
        }

        // Verificar que no se cree un bucle (la carpeta de destino no puede estar dentro de la que se mueve)
        const isDescendant = await folderService.isDescendantFolder(
          newParentId,
          folderId
        );
        if (isDescendant) {
          throw new Error("No puedes mover una carpeta dentro de sí misma");
        }
      }

      // Verificar que no exista otra carpeta con el mismo nombre en el destino
      const [existing] = await db.query(
        `
        SELECT id_folder FROM folders 
        WHERE name_folder = ? 
        AND parent_folder_id ${newParentId ? "= ?" : "IS NULL"}
        AND owner_user_id = ?
        AND id_folder != ?
      `,
        newParentId
          ? [folder.name_folder, newParentId, folder.owner_user_id, folderId]
          : [folder.name_folder, folder.owner_user_id, folderId]
      );

      if (existing.length > 0) {
        throw new Error("Ya existe una carpeta con ese nombre en el destino");
      }

      // Mover la carpeta
      await db.query(
        "UPDATE folders SET parent_folder_id = ? WHERE id_folder = ?",
        [newParentId, folderId]
      );

      // Retornar la carpeta movida
      const movedFolder = await folderService.getFolderById(
        folderId,
        userId,
        userRole
      );
      return movedFolder;
    } catch (error) {
      if (
        error.message.includes("No tienes permisos") ||
        error.message.includes("No puedes mover") ||
        error.message.includes("Ya existe una carpeta") ||
        error.message.includes("La carpeta de destino") ||
        error.message === "Carpeta no encontrada"
      ) {
        throw error;
      }
      console.error("Error moviendo carpeta:", error);
      throw new Error("Error al mover carpeta");
    }
  },

  // Verificar si una carpeta es descendiente de otra (para evitar bucles)
  isDescendantFolder: async (parentId, potentialDescendantId) => {
    try {
      const [result] = await db.query(
        `
        WITH RECURSIVE folder_hierarchy AS (
          SELECT id_folder, parent_folder_id, 0 as level
          FROM folders 
          WHERE id_folder = ?
          
          UNION ALL
          
          SELECT f.id_folder, f.parent_folder_id, fh.level + 1
          FROM folders f
          INNER JOIN folder_hierarchy fh ON f.parent_folder_id = fh.id_folder
          WHERE fh.level < 10
        )
        SELECT 1 as is_descendant
        FROM folder_hierarchy
        WHERE id_folder = ?
      `,
        [parentId, potentialDescendantId]
      );

      return result.length > 0;
    } catch (error) {
      console.error("Error verificando jerarquía de carpetas:", error);
      return false;
    }
  },

  // Obtener la ruta completa de una carpeta (breadcrumbs)
  getFolderPath: async (folderId, userId, userRole) => {
    try {
      // Verificar que el usuario tiene acceso a la carpeta
      const folder = await folderService.getFolderById(
        folderId,
        userId,
        userRole
      );
      if (!folder) {
        throw new Error("Carpeta no encontrada");
      }

      const [path] = await db.query(
        `
        WITH RECURSIVE folder_path AS (
          SELECT id_folder, name_folder, parent_folder_id, 0 as level
          FROM folders 
          WHERE id_folder = ?
          
          UNION ALL
          
          SELECT f.id_folder, f.name_folder, f.parent_folder_id, fp.level + 1
          FROM folders f
          INNER JOIN folder_path fp ON f.id_folder = fp.parent_folder_id
          WHERE fp.level < 20
        )
        SELECT id_folder, name_folder, level
        FROM folder_path
        ORDER BY level DESC
      `,
        [folderId]
      );

      return path;
    } catch (error) {
      if (
        error.message === "Carpeta no encontrada" ||
        error.message.includes("No tienes permisos")
      ) {
        throw error;
      }
      console.error("Error obteniendo ruta de carpeta:", error);
      throw new Error("Error al obtener ruta de carpeta");
    }
  },

  // Obtener estadísticas de una carpeta
  getFolderStats: async (folderId, userId, userRole) => {
    try {
      // Verificar que el usuario tiene acceso a la carpeta
      const folder = await folderService.getFolderById(
        folderId,
        userId,
        userRole
      );
      if (!folder) {
        throw new Error("Carpeta no encontrada");
      }

      const [stats] = await db.query(
        `
        SELECT 
          (SELECT COUNT(*) FROM folders WHERE parent_folder_id = ?) as direct_subfolders,
          (SELECT COUNT(*) FROM files WHERE folder_id = ?) as direct_files,
          (
            WITH RECURSIVE folder_tree AS (
              SELECT id_folder FROM folders WHERE id_folder = ?
              UNION ALL
              SELECT f.id_folder FROM folders f
              INNER JOIN folder_tree ft ON f.parent_folder_id = ft.id_folder
            )
            SELECT COUNT(*) - 1 FROM folder_tree
          ) as total_subfolders,
          (
            WITH RECURSIVE folder_tree AS (
              SELECT id_folder FROM folders WHERE id_folder = ?
              UNION ALL
              SELECT f.id_folder FROM folders f
              INNER JOIN folder_tree ft ON f.parent_folder_id = ft.id_folder
            )
            SELECT COUNT(*) FROM files 
            WHERE folder_id IN (SELECT id_folder FROM folder_tree)
          ) as total_files
      `,
        [folderId, folderId, folderId, folderId]
      );

      return stats[0];
    } catch (error) {
      if (
        error.message === "Carpeta no encontrada" ||
        error.message.includes("No tienes permisos")
      ) {
        throw error;
      }
      console.error("Error obteniendo estadísticas de carpeta:", error);
      throw new Error("Error al obtener estadísticas");
    }
  },

  // Buscar carpetas
  searchFolders: async (query, userId, userRole, parentId = null) => {
    try {
      let whereClause = "";
      let params = [];

      // Construir la consulta según el rol
      if (isAdmin({ role_user: userRole })) {
        // Admin puede buscar en todas las carpetas
        whereClause = "WHERE name_folder LIKE ?";
        params.push(`%${query}%`);
      } else {
        // Usuario normal solo en sus carpetas
        whereClause = "WHERE owner_user_id = ? AND name_folder LIKE ?";
        params.push(userId, `%${query}%`);
      }

      // Filtrar por carpeta padre si se especifica
      if (parentId) {
        whereClause += " AND parent_folder_id = ?";
        params.push(parentId);
      }

      const [results] = await db.query(
        `
        SELECT 
          f.id_folder,
          f.name_folder,
          f.parent_folder_id,
          f.owner_user_id,
          f.created_at_folder,
          u.name_user as owner_name,
          (SELECT COUNT(*) FROM folders WHERE parent_folder_id = f.id_folder) as subfolders_count,
          (SELECT COUNT(*) FROM files WHERE folder_id = f.id_folder) as files_count
        FROM folders f
        LEFT JOIN users u ON f.owner_user_id = u.id_user
        ${whereClause}
        ORDER BY f.name_folder ASC
        LIMIT 50
      `,
        params
      );

      return results;
    } catch (error) {
      console.error("Error buscando carpetas:", error);
      throw new Error("Error al buscar carpetas");
    }
  },

  // Duplicar una carpeta
  duplicateFolder: async (folderId, newName, userId, userRole) => {
    try {
      // Verificar que la carpeta existe y el usuario tiene permisos
      const folder = await folderService.getFolderById(
        folderId,
        userId,
        userRole
      );
      if (!folder) {
        throw new Error("Carpeta no encontrada");
      }

      // Solo el propietario o admin pueden duplicar
      if (
        !isOwnerOrAdmin(
          { id_user: userId, role_user: userRole },
          folder.owner_user_id
        )
      ) {
        throw new Error("No tienes permisos para duplicar esta carpeta");
      }

      // Generar nombre para la copia si no se especifica
      const copyName = newName || `${folder.name_folder} - Copia`;

      // Crear la carpeta duplicada
      const duplicatedFolder = await folderService.createFolder(
        {
          name_folder: copyName,
          parent_folder_id: folder.parent_folder_id,
          owner_user_id: userId, // El usuario actual se convierte en propietario
        },
        userId,
        userRole
      );

      return duplicatedFolder;
    } catch (error) {
      if (
        error.message === "Carpeta no encontrada" ||
        error.message.includes("No tienes permisos") ||
        error.message.includes("Ya existe una carpeta")
      ) {
        throw error;
      }
      console.error("Error duplicando carpeta:", error);
      throw new Error("Error al duplicar carpeta");
    }
  },
};

module.exports = folderService;
