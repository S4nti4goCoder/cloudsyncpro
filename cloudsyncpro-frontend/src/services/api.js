import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Variable para evitar múltiples requests de refresh simultáneos
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor: Añadir token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Manejar renovación automática de tokens
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente la devolvemos
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado renovar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Evitar renovación en rutas de auth que no necesitan token
      const authRoutes = [
        "/auth/login",
        "/auth/register",
        "/auth/recover-password",
        "/auth/reset-password",
      ];
      const isAuthRoute = authRoutes.some((route) =>
        originalRequest.url.includes(route)
      );

      if (isAuthRoute) {
        return Promise.reject(error);
      }

      // Si ya estamos en proceso de renovar el token
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No hay refresh token, redirigir a login
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Intentar renovar el token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken: refreshToken,
        });

        const { token: newToken } = response.data;

        // Guardar el nuevo token
        localStorage.setItem("token", newToken);

        // Actualizar el header para la petición original
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Procesar la cola de peticiones pendientes
        processQueue(null, newToken);

        // Reintentar la petición original
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla la renovación, limpiar todo y redirigir a login
        processQueue(refreshError, null);

        localStorage.clear();

        // Solo redirigir si no estamos ya en una página de auth
        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register") &&
          !window.location.pathname.includes("/forgot-password")
        ) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
