const db = require("../config/db");

exports.getUserProfile = async (id_user) => {
  const [rows] = await db.query(
    "SELECT id_user, name_user, email_user, role_user, status_user FROM users WHERE id_user = ?",
    [id_user]
  );
  const user = rows[0];

  if (!user) throw new Error("Usuario no encontrado");

  return user;
};
