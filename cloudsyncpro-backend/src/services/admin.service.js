// services/admin.service.js
const bcrypt = require("bcrypt");
const db = require("../config/db");

const adminService = {
  // Obtener estadísticas del sistema
  getSystemStats: async () => {
    try {
      // Estadísticas de usuarios
      const [userStats] = await db.query(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN role_user = 'admin' THEN 1 ELSE 0 END) as total_admins,
          SUM(CASE WHEN role_user = 'user' THEN 1 ELSE 0 END) as total_regular_users,
          SUM(CASE WHEN status_user = 'active' THEN 1 ELSE 0 END) as active_users,
          SUM(CASE WHEN status_user = 'banned' THEN 1 ELSE 0 END) as banned_users,
          SUM(CASE WHEN status_user = 'inactive' THEN 1 ELSE 0 END) as inactive_users,
          SUM(CASE WHEN DATE(created_at_user) = CURDATE() THEN 1 ELSE 0 END) as new_users_today,
          SUM(CASE WHEN DATE(created_at_user) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_users_week
        FROM users
      `);

      // Estadísticas de archivos y carpetas
      const [fileStats] = await db.query(`
        SELECT 
          COUNT(*) as total_files
        FROM files
      `);

      const [folderStats] = await db.query(`
        SELECT 
          COUNT(*) as total_folders
        FROM folders
      `);

      // Estadísticas de sesiones activas
      const [sessionStats] = await db.query(`
        SELECT 
          COUNT(*) as active_sessions,
          COUNT(DISTINCT id_user) as unique_active_users
        FROM refresh_tokens 
        WHERE is_revoked_refresh_token = 0 
        AND expires_at_refresh_token > NOW()
      `);

      // Registros de usuarios por mes (últimos 6 meses)
      const [monthlyGrowth] = await db.query(`
        SELECT 
          DATE_FORMAT(created_at_user, '%Y-%m') as month,
          COUNT(*) as new_users
        FROM users 
        WHERE created_at_user >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at_user, '%Y-%m')
        ORDER BY month DESC
      `);

      return {
        users: userStats[0],
        files: fileStats[0],
        folders: folderStats[0],
        sessions: sessionStats[0],
        growth: monthlyGrowth,
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      throw new Error("Error al obtener estadísticas del sistema");
    }
  },

  // Obtener todos los usuarios con filtros y paginación
  getAllUsers: async ({ page, limit, search, role, status }) => {
    try {
      const offset = (page - 1) * limit;

      // Construir la consulta base
      let whereConditions = [];
      let queryParams = [];

      if (search) {
        whereConditions.push("(name_user LIKE ? OR email_user LIKE ?)");
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      if (role && ["admin", "user"].includes(role)) {
        whereConditions.push("role_user = ?");
        queryParams.push(role);
      }

      if (status && ["active", "banned", "inactive"].includes(status)) {
        whereConditions.push("status_user = ?");
        queryParams.push(status);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Obtener usuarios
      const [users] = await db.query(
        `
        SELECT 
          id_user,
          name_user,
          email_user,
          role_user,
          status_user,
          created_at_user,
          (SELECT COUNT(*) FROM files WHERE owner_user_id = users.id_user) as total_files,
          (SELECT COUNT(*) FROM folders WHERE owner_user_id = users.id_user) as total_folders
        FROM users 
        ${whereClause}
        ORDER BY created_at_user DESC
        LIMIT ? OFFSET ?
      `,
        [...queryParams, limit, offset]
      );

      // Obtener total de usuarios para paginación
      const [totalCount] = await db.query(
        `
        SELECT COUNT(*) as total FROM users ${whereClause}
      `,
        queryParams
      );

      const totalUsers = totalCount[0].total;
      const totalPages = Math.ceil(totalUsers / limit);

      return {
        users,
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      throw new Error("Error al obtener usuarios");
    }
  },

  // Obtener usuario por ID
  getUserById: async (userId) => {
    try {
      const [users] = await db.query(
        `
        SELECT 
          id_user,
          name_user,
          email_user,
          role_user,
          status_user,
          created_at_user,
          (SELECT COUNT(*) FROM files WHERE owner_user_id = ?) as total_files,
          (SELECT COUNT(*) FROM folders WHERE owner_user_id = ?) as total_folders,
          (SELECT COUNT(*) FROM refresh_tokens WHERE id_user = ? AND is_revoked_refresh_token = 0) as active_sessions
        FROM users 
        WHERE id_user = ?
      `,
        [userId, userId, userId, userId]
      );

      if (users.length === 0) {
        return null;
      }

      return users[0];
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      throw new Error("Error al obtener usuario");
    }
  },

  // Actualizar rol de usuario
  updateUserRole: async (userId, newRole, adminId) => {
    try {
      // Verificar que el usuario existe
      const [users] = await db.query(
        "SELECT id_user, role_user FROM users WHERE id_user = ?",
        [userId]
      );

      if (users.length === 0) {
        throw new Error("Usuario no encontrado");
      }

      // Actualizar rol
      await db.query("UPDATE users SET role_user = ? WHERE id_user = ?", [
        newRole,
        userId,
      ]);

      // Log de la acción
      console.log(
        `Admin ${adminId} cambió el rol del usuario ${userId} a ${newRole}`
      );

      return {
        id_user: userId,
        previous_role: users[0].role_user,
        new_role: newRole,
        updated_by: adminId,
        updated_at: new Date(),
      };
    } catch (error) {
      console.error("Error actualizando rol:", error);
      throw error;
    }
  },

  // Actualizar estado de usuario
  updateUserStatus: async (userId, newStatus, adminId) => {
    try {
      // Verificar que el usuario existe
      const [users] = await db.query(
        "SELECT id_user, status_user FROM users WHERE id_user = ?",
        [userId]
      );

      if (users.length === 0) {
        throw new Error("Usuario no encontrado");
      }

      // Actualizar estado
      await db.query("UPDATE users SET status_user = ? WHERE id_user = ?", [
        newStatus,
        userId,
      ]);

      // Si se banea o desactiva al usuario, revocar todas sus sesiones
      if (newStatus === "banned" || newStatus === "inactive") {
        await db.query(
          "UPDATE refresh_tokens SET is_revoked_refresh_token = 1 WHERE id_user = ?",
          [userId]
        );
      }

      // Log de la acción
      console.log(
        `Admin ${adminId} cambió el estado del usuario ${userId} a ${newStatus}`
      );

      return {
        id_user: userId,
        previous_status: users[0].status_user,
        new_status: newStatus,
        updated_by: adminId,
        updated_at: new Date(),
      };
    } catch (error) {
      console.error("Error actualizando estado:", error);
      throw error;
    }
  },

  // Eliminar usuario (cambiar estado a inactive)
  deleteUser: async (userId, adminId) => {
    try {
      // Verificar que el usuario existe
      const [users] = await db.query(
        "SELECT id_user FROM users WHERE id_user = ?",
        [userId]
      );

      if (users.length === 0) {
        throw new Error("Usuario no encontrado");
      }

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

      // Log de la acción
      console.log(`Admin ${adminId} eliminó (desactivó) al usuario ${userId}`);

      return {
        id_user: userId,
        action: "deleted",
        deleted_by: adminId,
        deleted_at: new Date(),
      };
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      throw error;
    }
  },

  // Crear nuevo usuario
  createUser: async (
    { name_user, email_user, password_user, role_user },
    adminId
  ) => {
    try {
      // Verificar que el email no existe
      const [existing] = await db.query(
        "SELECT id_user FROM users WHERE email_user = ?",
        [email_user]
      );

      if (existing.length > 0) {
        throw new Error("El correo ya está registrado");
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password_user, 10);

      // Crear usuario
      const [result] = await db.query(
        "INSERT INTO users (name_user, email_user, password_user, role_user) VALUES (?, ?, ?, ?)",
        [name_user, email_user, hashedPassword, role_user]
      );

      // Log de la acción
      console.log(
        `Admin ${adminId} creó nuevo usuario ${result.insertId} con rol ${role_user}`
      );

      return {
        id_user: result.insertId,
        name_user,
        email_user,
        role_user,
        status_user: "active",
        created_by: adminId,
        created_at: new Date(),
      };
    } catch (error) {
      console.error("Error creando usuario:", error);
      throw error;
    }
  },

  // Obtener actividad reciente
  getRecentActivity: async (limit) => {
    try {
      // Obtener usuarios recientes
      const [recentUsers] = await db.query(
        `
        SELECT 
          'user_registered' as activity_type,
          name_user as description,
          created_at_user as created_at,
          'user' as icon
        FROM users 
        ORDER BY created_at_user DESC 
        LIMIT ?
      `,
        [limit]
      );

      // En el futuro aquí podrías agregar más tipos de actividad
      // como archivos subidos, carpetas creadas, etc.

      return recentUsers;
    } catch (error) {
      console.error("Error obteniendo actividad:", error);
      throw new Error("Error al obtener actividad reciente");
    }
  },
};

module.exports = adminService;
