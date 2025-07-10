const rateLimit = require("express-rate-limit");

// Rate limiter general para rutas de autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 intentos por IP cada 15 minutos
  message: {
    error: true,
    message:
      "Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.",
    retryAfter: Math.ceil(15 * 60),
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      message:
        "Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.",
      retryAfter: Math.ceil(15 * 60),
    });
  },
});

// Rate limiter específico para login (HÍBRIDO)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por combinación IP+Email cada 15 minutos
  message: {
    error: true,
    message:
      "Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.",
    retryAfter: Math.ceil(15 * 60),
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // HÍBRIDO: IP + Email
    return `${req.ip}-${req.body.email_user || "no-email"}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      message:
        "Demasiados intentos de inicio de sesión fallidos. Por seguridad, intenta de nuevo en 15 minutos.",
      retryAfter: Math.ceil(15 * 60),
    });
  },
});

// Rate limiter para registro (POR IP)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 15, // máximo 15 registros por IP cada hora
  message: {
    error: true,
    message: "Demasiados intentos de registro. Intenta de nuevo en 1 hora.",
    retryAfter: Math.ceil(60 * 60),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      message:
        "Demasiados intentos de registro. Por seguridad, intenta de nuevo en 1 hora.",
      retryAfter: Math.ceil(60 * 60),
    });
  },
});

// Rate limiter para recuperación de contraseña (HÍBRIDO - AJUSTADO)
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 intentos por combinación IP+Email cada hora
  message: {
    error: true,
    message:
      "Demasiados intentos de recuperación de contraseña. Intenta de nuevo en 1 hora.",
    retryAfter: Math.ceil(60 * 60),
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // HÍBRIDO: IP + Email
    return `${req.ip}-${req.body.email_user || "no-email"}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      message:
        "Demasiados intentos de recuperación de contraseña para este email. Intenta de nuevo en 1 hora.",
      retryAfter: Math.ceil(60 * 60),
    });
  },
});

module.exports = {
  authLimiter,
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
};
