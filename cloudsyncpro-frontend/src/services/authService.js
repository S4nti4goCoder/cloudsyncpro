import api from "./api";

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email_user: email,
        password_user: password,
      });

      // Guardar ambos tokens
      if (response.data.token && response.data.refreshToken) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

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

      // Guardar ambos tokens automáticamente después del registro
      if (response.data.token && response.data.refreshToken) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error de conexión",
      };
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await api.post("/auth/refresh", {
        refreshToken: refreshToken,
      });

      // Actualizar el access token
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);

        // También actualizar datos del usuario si vienen
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      }

      return { success: true, data: response.data };
    } catch (error) {
      // Si falla el refresh, limpiar todo y requerir login
      authService.clearTokens();
      return {
        success: false,
        message: error.response?.data?.message || "Error al renovar token",
        requireLogin: true,
      };
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        // Llamar al endpoint de logout en el backend
        await api.post("/auth/logout", {
          refreshToken: refreshToken,
        });
      }

      return { success: true };
    } catch (error) {
      // Aunque falle el logout en el backend, limpiar localmente
      return { success: true }; // Siempre retornar success para no bloquear al usuario
    } finally {
      // Siempre limpiar tokens localmente
      authService.clearTokens();
    }
  },

  clearTokens: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  getCurrentToken: () => {
    return localStorage.getItem("token");
  },

  getCurrentRefreshToken: () => {
    return localStorage.getItem("refreshToken");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    return !!(token && refreshToken);
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
