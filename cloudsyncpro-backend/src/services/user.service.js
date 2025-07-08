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

exports.updateUserProfile = async (id_user, { name_user, email_user }) => {
  // Validar si el email ya está en uso por otro usuario
  if (email_user) {
    const [existing] = await db.query(
      "SELECT id_user FROM users WHERE email_user = ? AND id_user != ?",
      [email_user, id_user]
    );
    if (existing.length > 0) {
      throw new Error("El correo ya está registrado por otro usuario");
    }
  }

  // Actualizar datos dinámicamente
  const fields = [];
  const values = [];

  if (name_user) {
    fields.push("name_user = ?");
    values.push(name_user);
  }

  if (email_user) {
    fields.push("email_user = ?");
    values.push(email_user);
  }

  if (fields.length === 0) {
    throw new Error("No se enviaron datos para actualizar");
  }

  values.push(id_user); // para el WHERE

  const query = `UPDATE users SET ${fields.join(", ")} WHERE id_user = ?`;
  await db.query(query, values);

  return { message: "Perfil actualizado exitosamente" };
};
