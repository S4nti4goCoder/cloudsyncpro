const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const {
  generateTokenPair,
  verifyRefreshToken,
  validateRefreshToken,
  generateAccessToken,
  revokeAllUserRefreshTokens,
} = require("../utils/tokenUtils");

const SECRET = process.env.JWT_SECRET || "cloudsync_secret";

exports.registerUser = async (
  { name_user, email_user, password_user },
  req = null
) => {
  const [existing] = await db.query(
    "SELECT * FROM users WHERE email_user = ?",
    [email_user]
  );
  if (existing.length) throw new Error("El correo ya está registrado");

  const hash = await bcrypt.hash(password_user, 10);
  const [result] = await db.query(
    "INSERT INTO users (name_user, email_user, password_user) VALUES (?, ?, ?)",
    [name_user, email_user, hash]
  );

  // Obtener datos del usuario recién creado
  const [newUser] = await db.query(
    "SELECT id_user, name_user, email_user, role_user FROM users WHERE id_user = ?",
    [result.insertId]
  );

  const user = newUser[0];

  // Generar par de tokens
  const userAgent = req?.get("User-Agent") || null;
  const ipAddress = req?.ip || req?.connection?.remoteAddress || null;

  const tokens = await generateTokenPair(
    {
      id_user: user.id_user,
      role_user: user.role_user,
    },
    userAgent,
    ipAddress
  );

  return {
    message: "Usuario registrado exitosamente",
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
    user: {
      id_user: user.id_user,
      name_user: user.name_user,
      email_user: user.email_user,
      role_user: user.role_user,
    },
  };
};

exports.loginUser = async ({ email_user, password_user }, req = null) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email_user = ?", [
    email_user,
  ]);
  const user = rows[0];
  if (!user) throw new Error("Credenciales incorrectas");

  const match = await bcrypt.compare(password_user, user.password_user);
  if (!match) throw new Error("Credenciales incorrectas");

  // Generar par de tokens
  const userAgent = req?.get("User-Agent") || null;
  const ipAddress = req?.ip || req?.connection?.remoteAddress || null;

  const tokens = await generateTokenPair(
    {
      id_user: user.id_user,
      role_user: user.role_user,
    },
    userAgent,
    ipAddress
  );

  return {
    message: "Login exitoso",
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
    user: {
      id_user: user.id_user,
      name_user: user.name_user,
      email_user: user.email_user,
      role_user: user.role_user,
    },
  };
};

exports.refreshAccessToken = async (refreshToken) => {
  try {
    // Verificar el refresh token JWT
    const decoded = verifyRefreshToken(refreshToken);

    // Validar que el refresh token existe en la base de datos y no está revocado
    await validateRefreshToken(refreshToken, decoded.id_user);

    // Obtener datos actuales del usuario
    const [rows] = await db.query(
      "SELECT id_user, name_user, email_user, role_user, status_user FROM users WHERE id_user = ?",
      [decoded.id_user]
    );

    if (rows.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    const user = rows[0];

    // Verificar que el usuario esté activo
    if (user.status_user !== "active") {
      throw new Error("Usuario inactivo");
    }

    // Generar nuevo access token
    const newAccessToken = generateAccessToken({
      id_user: user.id_user,
      role_user: user.role_user,
    });

    return {
      message: "Token renovado exitosamente",
      token: newAccessToken,
      expiresIn: 15 * 60, // 15 minutos en segundos
      user: {
        id_user: user.id_user,
        name_user: user.name_user,
        email_user: user.email_user,
        role_user: user.role_user,
      },
    };
  } catch (error) {
    throw new Error(`Error al renovar token: ${error.message}`);
  }
};

exports.logoutUser = async (refreshToken, userId = null) => {
  try {
    if (refreshToken) {
      // Si se proporciona el refresh token, revocarlo específicamente
      const { revokeRefreshToken } = require("../utils/tokenUtils");
      await revokeRefreshToken(refreshToken);
    }

    if (userId) {
      // Si se proporciona el userId, revocar todos los refresh tokens del usuario
      await revokeAllUserRefreshTokens(userId);
    }

    return {
      message: "Logout exitoso",
    };
  } catch (error) {
    console.error("Error en logout:", error);
    // No lanzar error en logout para evitar bloquear al usuario
    return {
      message: "Logout completado",
    };
  }
};

exports.recoverPassword = async (email_user) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email_user = ?", [
    email_user,
  ]);
  const user = rows[0];
  if (!user) throw new Error("El correo no está registrado");

  const token = jwt.sign(
    { id_user: user.id_user },
    SECRET,
    { expiresIn: "15m" } // Token válido por 15 minutos
  );

  // Aquí simulas el envío del enlace
  const recoveryLink = `http://localhost:5173/recover-password?token=${token}`;

  return {
    message: "Token de recuperación generado correctamente",
    recoveryLink, // Simulación, luego lo enviaremos por correo real
    expiresIn: "15 minutos",
  };
};

exports.resetPassword = async (token, newPassword) => {
  let payload;
  try {
    payload = jwt.verify(token, SECRET);
  } catch (err) {
    throw new Error("Token inválido o expirado");
  }

  const hash = await bcrypt.hash(newPassword, 10);

  // Actualizar contraseña
  await db.query("UPDATE users SET password_user = ? WHERE id_user = ?", [
    hash,
    payload.id_user,
  ]);

  // Revocar todos los refresh tokens del usuario por seguridad
  await revokeAllUserRefreshTokens(payload.id_user);

  return {
    message:
      "Contraseña actualizada exitosamente. Por seguridad, debes iniciar sesión nuevamente.",
  };
};
