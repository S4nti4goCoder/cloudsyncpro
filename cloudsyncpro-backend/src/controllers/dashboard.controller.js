// controllers/dashboard.controller.js
const pool = require("../config/db");
const { isAdmin } = require("../middlewares/roleAuth.middleware");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const userRole = req.user.role_user;

    // Estadísticas básicas para todos los usuarios
    const [userStats] = await pool.query("SELECT COUNT(*) AS total FROM users");

    // Datos específicos según el rol
    let dashboardData = {
      user: req.user,
      stats: {
        total_users: userStats[0].total,
      },
      role: userRole,
    };

    if (isAdmin(req.user)) {
      // Datos adicionales para administradores
      const [adminStats] = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE role_user = 'admin') as total_admins,
          (SELECT COUNT(*) FROM users WHERE role_user = 'user') as total_regular_users,
          (SELECT COUNT(*) FROM users WHERE status_user = 'active') as active_users,
          (SELECT COUNT(*) FROM users WHERE status_user = 'banned') as banned_users,
          (SELECT COUNT(*) FROM users WHERE status_user = 'inactive') as inactive_users,
          (SELECT COUNT(*) FROM files) as total_files,
          (SELECT COUNT(*) FROM folders) as total_folders,
          (SELECT COUNT(*) FROM refresh_tokens WHERE is_revoked_refresh_token = 0 AND expires_at_refresh_token > NOW()) as active_sessions
      `);

      // Usuarios recientes para admin
      const [recentUsers] = await pool.query(`
        SELECT id_user, name_user, email_user, role_user, status_user, created_at_user
        FROM users 
        ORDER BY created_at_user DESC 
        LIMIT 5
      `);

      dashboardData.adminStats = adminStats[0];
      dashboardData.recentUsers = recentUsers;
    } else {
      // Datos específicos para usuarios regulares
      const [userFiles] = await pool.query(
        `
        SELECT COUNT(*) as my_files FROM files WHERE owner_user_id = ?
      `,
        [userId]
      );

      const [userFolders] = await pool.query(
        `
        SELECT COUNT(*) as my_folders FROM folders WHERE owner_user_id = ?
      `,
        [userId]
      );

      dashboardData.userStats = {
        my_files: userFiles[0].my_files,
        my_folders: userFolders[0].my_folders,
      };
    }

    res.json(dashboardData);
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error.message);
    res.status(500).json({ message: "Error del servidor" });
  }
};
