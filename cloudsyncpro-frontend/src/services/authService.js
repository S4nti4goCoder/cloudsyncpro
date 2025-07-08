import api from "./api";

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email_user: email,
        password_user: password,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error de conexión",
      };
    }
  },

  register: async (email, password) => {
    try {
      const response = await api.post("/auth/register", {
        name_user: email.split("@")[0], // Usar parte del email como nombre temporal
        email_user: email,
        password_user: password,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error de conexión",
      };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/recover-password", {
        email_user: email,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error de conexión",
      };
    }
  },
};
