const jwt = require("jsonwebtoken");
const db = require("../config/db");

const ACCESS_SECRET = process.env.JWT_SECRET || "cloudsync_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "cloudsync_refresh_secret";

/**
 * Genera un access token (JWT de corta duración)
 * @param {Object} payload - Datos del usuario a incluir en el token
 * @returns {string} - Access token JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: "15m", // 15 minutos
  });
};

/**
 * Genera un refresh token (JWT de larga duración)
 * @param {Object} payload - Datos del usuario a incluir en el token
 * @returns {string} - Refresh token JWT
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: "1d", // 1 día (24 horas)
  });
};

/**
 * Verifica y decodifica un access token
 * @param {string} token - Access token a verificar
 * @returns {Object} - Payload decodificado del token
 * @throws {Error} - Si el token es inválido o expirado
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (error) {
    throw new Error("Access token inválido o expirado");
  }
};

/**
 * Verifica y decodifica un refresh token
 * @param {string} token - Refresh token a verificar
 * @returns {Object} - Payload decodificado del token
 * @throws {Error} - Si el token es inválido o expirado
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    throw new Error("Refresh token inválido o expirado");
  }
};

/**
 * Guarda un refresh token en la base de datos
 * @param {number} userId - ID del usuario
 * @param {string} refreshToken - Refresh token a guardar
 * @param {string} userAgent - User agent del cliente (opcional)
 * @param {string} ipAddress - Dirección IP del cliente (opcional)
 * @returns {Promise<Object>} - Resultado de la operación
 */
const storeRefreshToken = async (
  userId,
  refreshToken,
  userAgent = null,
  ipAddress = null
) => {
  try {
    // Calcular fecha de expiración (1 día desde ahora)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // +1 día

    // Insertar en la base de datos
    const [result] = await db.query(
      `INSERT INTO refresh_tokens (
        id_user, 
        token_hash_refresh_token, 
        expires_at_refresh_token, 
        user_agent_refresh_token, 
        ip_address_refresh_token
      ) VALUES (?, ?, ?, ?, ?)`,
      [userId, refreshToken, expiresAt, userAgent, ipAddress]
    );

    return {
      success: true,
      tokenId: result.insertId,
      expiresAt: expiresAt,
    };
  } catch (error) {
    console.error("Error al guardar refresh token:", error);
    throw new Error("Error al guardar refresh token");
  }
};

/**
 * Verifica si un refresh token existe y es válido en la base de datos
 * @param {string} refreshToken - Refresh token a verificar
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} - Información del token si es válido
 */
const validateRefreshToken = async (refreshToken, userId) => {
  try {
    const [rows] = await db.query(
      `SELECT id_refresh_token, id_user, expires_at_refresh_token, is_revoked_refresh_token 
       FROM refresh_tokens 
       WHERE token_hash_refresh_token = ? AND id_user = ?`,
      [refreshToken, userId]
    );

    if (rows.length === 0) {
      throw new Error("Refresh token no encontrado");
    }

    const tokenData = rows[0];

    // Verificar si el token está revocado
    if (tokenData.is_revoked_refresh_token) {
      throw new Error("Refresh token revocado");
    }

    // Verificar si el token ha expirado
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at_refresh_token);

    if (now > expiresAt) {
      // Eliminar token expirado automáticamente
      await revokeRefreshToken(refreshToken);
      throw new Error("Refresh token expirado");
    }

    return {
      valid: true,
      tokenId: tokenData.id_refresh_token,
      userId: tokenData.id_user,
      expiresAt: tokenData.expires_at_refresh_token,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Revoca un refresh token (lo marca como revocado)
 * @param {string} refreshToken - Refresh token a revocar
 * @returns {Promise<boolean>} - True si se revocó exitosamente
 */
const revokeRefreshToken = async (refreshToken) => {
  try {
    const [result] = await db.query(
      `UPDATE refresh_tokens 
       SET is_revoked_refresh_token = true, updated_at_refresh_token = CURRENT_TIMESTAMP 
       WHERE token_hash_refresh_token = ?`,
      [refreshToken]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error al revocar refresh token:", error);
    throw new Error("Error al revocar refresh token");
  }
};

/**
 * Revoca todos los refresh tokens de un usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise<number>} - Número de tokens revocados
 */
const revokeAllUserRefreshTokens = async (userId) => {
  try {
    const [result] = await db.query(
      `UPDATE refresh_tokens 
       SET is_revoked_refresh_token = true, updated_at_refresh_token = CURRENT_TIMESTAMP 
       WHERE id_user = ? AND is_revoked_refresh_token = false`,
      [userId]
    );

    return result.affectedRows;
  } catch (error) {
    console.error("Error al revocar todos los refresh tokens:", error);
    throw new Error("Error al revocar refresh tokens del usuario");
  }
};

/**
 * Limpia tokens expirados de la base de datos
 * @returns {Promise<number>} - Número de tokens eliminados
 */
const cleanExpiredTokens = async () => {
  try {
    const [result] = await db.query(
      `DELETE FROM refresh_tokens 
       WHERE expires_at_refresh_token < CURRENT_TIMESTAMP OR is_revoked_refresh_token = true`
    );

    return result.affectedRows;
  } catch (error) {
    console.error("Error al limpiar tokens expirados:", error);
    throw new Error("Error al limpiar tokens expirados");
  }
};

/**
 * Genera un par de tokens (access + refresh) para un usuario
 * @param {Object} userPayload - Datos del usuario para incluir en los tokens
 * @param {string} userAgent - User agent del cliente
 * @param {string} ipAddress - Dirección IP del cliente
 * @returns {Promise<Object>} - Par de tokens generados
 */
const generateTokenPair = async (
  userPayload,
  userAgent = null,
  ipAddress = null
) => {
  try {
    // Generar ambos tokens
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken({
      id_user: userPayload.id_user,
    });

    // Guardar refresh token en la base de datos
    await storeRefreshToken(
      userPayload.id_user,
      refreshToken,
      userAgent,
      ipAddress
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutos en segundos
      tokenType: "Bearer",
    };
  } catch (error) {
    throw new Error("Error al generar par de tokens");
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  storeRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  cleanExpiredTokens,
  generateTokenPair,
};
