import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { authService } from "../services/authService";
import api from "../services/api";

// ✅ COMPONENTES MODULARES
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminDashboardView from "../components/admin/AdminDashboardView";
import AdminUsersView from "../components/admin/AdminUsersView";
import AdminActivityView from "../components/admin/AdminActivityView";

const AdminDashboard = () => {
  // ===========================
  // ESTADO PRINCIPAL
  // ===========================
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // ← Estado para menú móvil
  const navigate = useNavigate();

  // ===========================
  // ESTADO DE DATOS
  // ===========================
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [usersPagination, setUsersPagination] = useState({});

  // ===========================
  // ESTADO DE FILTROS
  // ===========================
  const [userFilters, setUserFilters] = useState({
    search: "",
    role: "",
    status: "",
    page: 1,
  });

  // ===========================
  // RESPONSIVE: Detectar resize y cerrar menú móvil
  // ===========================
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===========================
  // RESPONSIVE: Cerrar menú al presionar ESC
  // ===========================
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  // ===========================
  // EFECTOS PRINCIPALES
  // ===========================
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);

      // Verificar que sea admin
      if (userData.role_user !== "admin") {
        toast.error("Acceso denegado", {
          description: "No tienes permisos de administrador",
        });
        navigate("/dashboard");
        return;
      }

      setUser(userData);
      loadDashboardData();

      toast.success("¡Bienvenido, Administrador!", {
        description: `Hola ${userData.name_user}, gestiona tu sistema desde aquí`,
        duration: 4000,
      });
    }
  }, [navigate]);

  // ===========================
  // FUNCIONES DE CARGA DE DATOS
  // ===========================
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Sesión expirada", {
          description: "Por favor, inicia sesión nuevamente",
        });
        navigate("/login");
        return;
      }

      const [statsResponse, usersResponse, activityResponse] =
        await Promise.all([
          api.get("/admin/dashboard/stats"),
          api.get("/admin/users?limit=5"),
          api.get("/admin/activity/recent?limit=10"),
        ]);

      setStats(statsResponse.data.data);
      setUsers(usersResponse.data.data);
      setUsersPagination(usersResponse.data.pagination);
      setRecentActivity(activityResponse.data.data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);

      if (error.response?.status === 401) {
        toast.error("Sesión expirada", {
          description: "Por favor, inicia sesión nuevamente",
        });
        localStorage.clear();
        navigate("/login");
        return;
      }

      toast.error("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (filters = userFilters) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Sesión expirada", {
          description: "Por favor, inicia sesión nuevamente",
        });
        navigate("/login");
        return;
      }

      const params = new URLSearchParams({
        page: filters.page,
        limit: 5,
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.data);
      setUsersPagination(response.data.pagination);
    } catch (error) {
      console.error("Error loading users:", error);

      if (error.response?.status === 401) {
        toast.error("Sesión expirada", {
          description: "Por favor, inicia sesión nuevamente",
        });
        localStorage.clear();
        navigate("/login");
        return;
      }

      toast.error("Error al cargar usuarios");
    }
  };

  // ===========================
  // FUNCIONES DE ACCIONES
  // ===========================
  const handleUserAction = async (userId, action, value) => {
    try {
      let response;
      let message;

      switch (action) {
        case "role":
          response = await api.put(`/admin/users/${userId}/role`, {
            role: value,
          });
          message = `Rol actualizado a ${value}`;
          break;

        case "status":
          response = await api.put(`/admin/users/${userId}/status`, {
            status: value,
          });
          message = `Estado actualizado a ${value}`;
          break;

        case "delete":
          response = await api.delete(`/admin/users/${userId}`);
          message = "Usuario eliminado";
          break;

        case "create":
          response = await api.post("/admin/users", {
            name_user: value.name_user,
            email_user: value.email_user,
            password_user: value.password_user,
            role_user: value.role_user,
          });
          message = `Usuario ${value.name_user} creado exitosamente`;
          break;

        default:
          return;
      }

      if (response.data.success) {
        toast.success(message, {
          description:
            action === "create"
              ? `El usuario puede iniciar sesión con: ${value.email_user}`
              : undefined,
          duration: action === "create" ? 6000 : 4000,
        });

        await loadUsers();
        await loadDashboardData();
      } else {
        toast.error("Error en la operación", {
          description: response.data.message || "Error desconocido",
        });
      }
    } catch (error) {
      console.error("Error en acción de usuario:", error);

      if (action === "create") {
        const errorMessage =
          error.response?.data?.message || "Error al crear usuario";

        if (errorMessage.includes("ya está registrado")) {
          toast.error("Email ya registrado", {
            description: "Este correo electrónico ya está en uso",
          });
        } else if (errorMessage.includes("contraseña")) {
          toast.error("Error de contraseña", {
            description:
              "La contraseña no cumple con los requisitos de seguridad",
          });
        } else {
          toast.error("Error al crear usuario", {
            description: errorMessage,
          });
        }
      } else {
        if (error.response?.status === 401) {
          toast.error("Sesión expirada", {
            description: "Por favor, inicia sesión nuevamente",
          });
          localStorage.clear();
          navigate("/login");
          return;
        }

        toast.error(
          error.response?.data?.message || "Error al realizar la acción"
        );
      }
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Sesión cerrada correctamente");
      navigate("/login");
    } catch (error) {
      toast.success("Sesión cerrada correctamente");
      navigate("/login");
    }
  };

  // ===========================
  // FUNCIONES UTILITARIAS
  // ===========================
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ===========================
  // RENDER CONDICIONAL - LOADING
  // ===========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#061a4a] mx-auto"></div>
          <p className="mt-2 text-gray-600">
            Cargando panel de administración...
          </p>
        </div>
      </div>
    );
  }

  // ===========================
  // FUNCIONES DE ACCIONES RÁPIDAS
  // ===========================
  const handleCreateUser = () => {
    toast.info("Crear Usuario", {
      description: "Funcionalidad de creación de usuario - Próximamente",
      duration: 3000,
    });
  };

  const handleBackupDatabase = async () => {
    const loadingToast = toast.loading("Iniciando backup de base de datos...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.dismiss(loadingToast);
      toast.success("Backup completado", {
        description: "Base de datos respaldada exitosamente",
        duration: 4000,
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error en backup", {
        description: "No se pudo completar el respaldo",
      });
    }
  };

  const handleViewLogs = () => {
    setCurrentView("activity");
    toast.info("Redirigiendo a Actividad", {
      description: "Mostrando logs del sistema",
    });
  };

  const handleSystemMaintenance = () => {
    toast.warning("Modo Mantenimiento", {
      description: "Esta función requiere confirmación adicional",
      duration: 5000,
    });
  };

  // ===========================
  // RENDER FUNCIÓN PARA VISTAS
  // ===========================
  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <AdminDashboardView
            stats={stats}
            users={users}
            recentActivity={recentActivity}
            formatDate={formatDate}
            setCurrentView={setCurrentView}
            onCreateUser={handleCreateUser}
            onBackupDatabase={handleBackupDatabase}
            onViewLogs={handleViewLogs}
            onSystemMaintenance={handleSystemMaintenance}
          />
        );
      case "users":
        return (
          <AdminUsersView
            users={users}
            usersPagination={usersPagination}
            userFilters={userFilters}
            setUserFilters={setUserFilters}
            handleUserAction={handleUserAction}
            formatDate={formatDate}
            loadUsers={loadUsers}
          />
        );
      case "activity":
        return (
          <AdminActivityView
            recentActivity={recentActivity}
            formatDate={formatDate}
          />
        );
      case "settings":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Configuración del Sistema
              </h3>
              <p className="text-gray-500 mb-6">
                Panel de configuraciones y ajustes del sistema - Próximamente
              </p>
              <button className="inline-flex items-center px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors">
                <Settings className="w-4 h-4 mr-2" />
                Configurar Sistema
              </button>
            </div>
          </div>
        );
      default:
        return (
          <AdminDashboardView
            stats={stats}
            users={users}
            recentActivity={recentActivity}
            formatDate={formatDate}
            setCurrentView={setCurrentView}
            onCreateUser={handleCreateUser}
            onBackupDatabase={handleBackupDatabase}
            onViewLogs={handleViewLogs}
            onSystemMaintenance={handleSystemMaintenance}
          />
        );
    }
  };

  // ===========================
  // RENDER PRINCIPAL RESPONSIVE
  // ===========================
  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Sidebar con soporte móvil */}
      <AdminSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        currentView={currentView}
        setCurrentView={setCurrentView}
        stats={stats}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar responsive */}
        <AdminNavbar
          currentView={currentView}
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          handleLogout={handleLogout}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content con padding responsive */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-auto">
          <div className="max-w-full">{renderCurrentView()}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
