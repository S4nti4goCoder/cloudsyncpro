import { useState, useEffect } from "react";
import api from "../services/api";

const usePasswordValidation = (password) => {
  const [validation, setValidation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Validación inmediata desde el primer carácter
    if (!password) {
      setValidation(null);
      return;
    }

    const validatePassword = async () => {
      setIsLoading(true);
      try {
        const response = await api.post("/auth/validate-password", {
          password: password,
        });

        if (response.data.success) {
          setValidation(response.data.validation);
        }
      } catch (error) {
        // Si hay error en la validación, asumir que es inválida
        setValidation({
          isValid: false,
          strengthScore: 0,
          strengthLevel: "muy_debil",
          requirements: {
            minLength: false,
            hasUpperCase: false,
            hasLowerCase: false,
            hasNumbers: false,
            hasSpecialChars: false,
            noCommonPasswords: false,
          },
          suggestions: ["Error al validar contraseña"],
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Reducir el debounce a 200ms para respuesta más rápida
    const timeoutId = setTimeout(validatePassword, 200);

    return () => clearTimeout(timeoutId);
  }, [password]);

  return { validation, isLoading };
};

export default usePasswordValidation;
