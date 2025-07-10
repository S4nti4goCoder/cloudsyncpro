// controllers/admin.controller.js
const { validationResult } = require("express-validator");
const adminService = require("../services/admin.service");
const { isAdmin } = require("../middlewares/roleAuth.middleware");

const adminController = {
  // Obtener estadísticas del sistema para el dashboard de admin
  getDashboardStats: async (req, res) => {
    try {
      const stats = await adminService.getSystemStats();

      res.json({
        success: true,
        message: "Estadísticas obtenidas exitosamente",
        data: stats,
      });
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Obtener todos los usuarios (con paginación)
  getAllUsers: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        role = "",
        status = "",
      } = req.query;

      const result = await adminService.getAllUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        role,
        status,
      });

      res.json({
        success: true,
        message: "Usuarios obtenidos exitosamente",
        data: result.users,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalUsers: result.totalUsers,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Obtener un usuario específico
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await adminService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Usuario obtenido exitosamente",
        data: user,
      });
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Actualizar rol de usuario
  updateUserRole: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { role } = req.body;
      const adminId = req.user.id_user;

      // No permitir que un admin se quite a sí mismo los permisos de admin
      if (parseInt(id) === adminId && role !== "admin") {
        return res.status(400).json({
          success: false,
          message: "No puedes cambiar tu propio rol de administrador",
        });
      }

      const result = await adminService.updateUserRole(id, role, adminId);

      res.json({
        success: true,
        message: `Rol actualizado a ${role} exitosamente`,
        data: result,
      });
    } catch (error) {
      console.error("Error al actualizar rol:", error);

      if (error.message === "Usuario no encontrado") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Actualizar estado de usuario
  updateUserStatus: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { status } = req.body;
      const adminId = req.user.id_user;

      // No permitir que un admin se desactive a sí mismo
      if (parseInt(id) === adminId && status !== "active") {
        return res.status(400).json({
          success: false,
          message: "No puedes cambiar tu propio estado",
        });
      }

      const result = await adminService.updateUserStatus(id, status, adminId);

      res.json({
        success: true,
        message: `Estado actualizado a ${status} exitosamente`,
        data: result,
      });
    } catch (error) {
      console.error("Error al actualizar estado:", error);

      if (error.message === "Usuario no encontrado") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Eliminar usuario (soft delete)
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id_user;

      // No permitir que un admin se elimine a sí mismo
      if (parseInt(id) === adminId) {
        return res.status(400).json({
          success: false,
          message: "No puedes eliminar tu propia cuenta",
        });
      }

      const result = await adminService.deleteUser(id, adminId);

      res.json({
        success: true,
        message: "Usuario eliminado exitosamente",
        data: result,
      });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);

      if (error.message === "Usuario no encontrado") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Crear nuevo usuario desde admin
  createUser: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: errors.array(),
        });
      }

      const {
        name_user,
        email_user,
        password_user,
        role_user = "user",
      } = req.body;
      const adminId = req.user.id_user;

      const result = await adminService.createUser(
        {
          name_user,
          email_user,
          password_user,
          role_user,
        },
        adminId
      );

      res.status(201).json({
        success: true,
        message: "Usuario creado exitosamente",
        data: result,
      });
    } catch (error) {
      console.error("Error al crear usuario:", error);

      if (error.message === "El correo ya está registrado") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  // Obtener actividad reciente del sistema
  getRecentActivity: async (req, res) => {
    try {
      const { limit = 20 } = req.query;

      const activities = await adminService.getRecentActivity(parseInt(limit));

      res.json({
        success: true,
        message: "Actividad reciente obtenida exitosamente",
        data: activities,
      });
    } catch (error) {
      console.error("Error al obtener actividad:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
};

module.exports = adminController;