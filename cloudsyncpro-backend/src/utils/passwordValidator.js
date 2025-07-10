const validator = require("validator");

/**
 * Valida la fortaleza de una contraseña
 * @param {string} password - La contraseña a validar
 * @returns {Object} - Resultado de la validación
 */
const validatePasswordStrength = (password) => {
  const errors = [];
  const requirements = {
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChars: false,
    noCommonPasswords: false,
  };

  // Lista de contraseñas comunes que debemos rechazar
  const commonPasswords = [
    "password",
    "123456",
    "123456789",
    "qwerty",
    "abc123",
    "password123",
    "admin",
    "letmein",
    "welcome",
    "monkey",
    "1234567890",
    "password1",
    "123123",
    "qwerty123",
    "dragon",
    "master",
    "login",
    "admin123",
    "root",
  ];

  // 1. Verificar longitud mínima (8 caracteres)
  if (password.length >= 8) {
    requirements.minLength = true;
  } else {
    errors.push("La contraseña debe tener al menos 8 caracteres");
  }

  // 2. Verificar al menos una mayúscula
  if (/[A-Z]/.test(password)) {
    requirements.hasUpperCase = true;
  } else {
    errors.push("La contraseña debe contener al menos una letra mayúscula");
  }

  // 3. Verificar al menos una minúscula
  if (/[a-z]/.test(password)) {
    requirements.hasLowerCase = true;
  } else {
    errors.push("La contraseña debe contener al menos una letra minúscula");
  }

  // 4. Verificar al menos un número
  if (/[0-9]/.test(password)) {
    requirements.hasNumbers = true;
  } else {
    errors.push("La contraseña debe contener al menos un número");
  }

  // 5. Verificar al menos un carácter especial
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    requirements.hasSpecialChars = true;
  } else {
    errors.push(
      "La contraseña debe contener al menos un carácter especial (!@#$%^&*)"
    );
  }

  // 6. Verificar que no sea una contraseña común
  if (!commonPasswords.includes(password.toLowerCase())) {
    requirements.noCommonPasswords = true;
  } else {
    errors.push("Esta contraseña es muy común y fácil de adivinar");
  }

  // Calcular puntuación de fortaleza (0-100)
  const completedRequirements = Object.values(requirements).filter(
    (req) => req
  ).length;
  const strengthScore = Math.round((completedRequirements / 6) * 100);

  // Determinar nivel de fortaleza
  let strengthLevel = "muy_debil";
  if (strengthScore >= 100) strengthLevel = "muy_fuerte";
  else if (strengthScore >= 83) strengthLevel = "fuerte";
  else if (strengthScore >= 66) strengthLevel = "moderada";
  else if (strengthScore >= 50) strengthLevel = "debil";

  return {
    isValid: errors.length === 0,
    errors,
    requirements,
    strengthScore,
    strengthLevel,
    suggestions: generateSuggestions(requirements),
  };
};

/**
 * Genera sugerencias para mejorar la contraseña
 */
const generateSuggestions = (requirements) => {
  const suggestions = [];

  if (!requirements.minLength) {
    suggestions.push("Usa al menos 8 caracteres");
  }
  if (!requirements.hasUpperCase) {
    suggestions.push("Añade al menos una letra mayúscula (A-Z)");
  }
  if (!requirements.hasLowerCase) {
    suggestions.push("Añade al menos una letra minúscula (a-z)");
  }
  if (!requirements.hasNumbers) {
    suggestions.push("Incluye al menos un número (0-9)");
  }
  if (!requirements.hasSpecialChars) {
    suggestions.push("Usa al menos un carácter especial (!@#$%^&*)");
  }
  if (!requirements.noCommonPasswords) {
    suggestions.push('Evita contraseñas comunes como "password" o "123456"');
  }

  return suggestions;
};

/**
 * Middleware de validación para Express
 */
const validatePasswordMiddleware = (req, res, next) => {
  const password = req.body.password_user || req.body.new_password;

  if (!password) {
    return res.status(400).json({
      error: true,
      message: "La contraseña es requerida",
    });
  }

  const validation = validatePasswordStrength(password);

  if (!validation.isValid) {
    return res.status(400).json({
      error: true,
      message: "La contraseña no cumple con los requisitos de seguridad",
      passwordValidation: {
        errors: validation.errors,
        requirements: validation.requirements,
        strengthScore: validation.strengthScore,
        strengthLevel: validation.strengthLevel,
        suggestions: validation.suggestions,
      },
    });
  }

  // Si la contraseña es válida, continuar
  next();
};

module.exports = {
  validatePasswordStrength,
  validatePasswordMiddleware,
};
