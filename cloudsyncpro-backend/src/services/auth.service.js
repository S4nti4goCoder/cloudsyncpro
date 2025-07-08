const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const SECRET = process.env.JWT_SECRET || "cloudsync_secret";

exports.registerUser = async ({ name_user, email_user, password_user }) => {
  const [existing] = await db.query(
    "SELECT * FROM users WHERE email_user = ?",
    [email_user]
  );
  if (existing.length) throw new Error("El correo ya está registrado");

  const hash = await bcrypt.hash(password_user, 10);
  await db.query(
    "INSERT INTO users (name_user, email_user, password_user) VALUES (?, ?, ?)",
    [name_user, email_user, hash]
  );

  return { message: "Usuario registrado exitosamente" };
};

exports.loginUser = async ({ email_user, password_user }) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email_user = ?", [
    email_user,
  ]);
  const user = rows[0];
  if (!user) throw new Error("Credenciales incorrectas");

  const match = await bcrypt.compare(password_user, user.password_user);
  if (!match) throw new Error("Credenciales incorrectas");

  const token = jwt.sign(
    { id_user: user.id_user, role_user: user.role_user },
    SECRET,
    { expiresIn: "1d" }
  );

  return {
    message: "Login exitoso",
    token,
    user: {
      id_user: user.id_user,
      name_user: user.name_user,
      email_user: user.email_user,
      role_user: user.role_user,
    },
  };
};
