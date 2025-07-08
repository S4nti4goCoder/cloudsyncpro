const pool = require("../config/db");

exports.getDashboardData = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT COUNT(*) AS total FROM users");

    res.json({
      user: req.user, // Información del usuario autenticado (extraída del token)
      stats: {
        total_users: users[0].total,
        // Aquí en el futuro podrías añadir más estadísticas
        // como: total_documents, total_folders, etc.
      },
    });
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error.message);
    res.status(500).json({ message: "Error del servidor" });
  }
};