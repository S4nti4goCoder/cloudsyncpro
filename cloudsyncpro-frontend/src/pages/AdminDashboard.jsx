import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../services/authService";
import api from "../services/api";

// ✅ NUEVOS COMPONENTES MODULARES
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
  // EFECTOS
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
      const [statsResponse, usersResponse, activityResponse] =
        await Promise.all([
          api.get("/admin/dashboard/stats"),
          api.get("/admin/users?limit=10"),
          api.get("/admin/activity/recent?limit=10"),
        ]);

      setStats(statsResponse.data.data);
      setUsers(usersResponse.data.data);
      setUsersPagination(usersResponse.data.pagination);
      setRecentActivity(activityResponse.data.data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (filters = userFilters) => {
    try {
      const params = new URLSearchParams({
        page: filters.page,
        limit: 10,
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.data);
      setUsersPagination(response.data.pagination);
    } catch (error) {
      console.error("Error loading users:", error);
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
        default:
          return;
      }

      if (response.data.success) {
        toast.success(message);
        loadUsers();
        loadDashboardData(); // Recargar stats
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al realizar la acción"
      );
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
      default:
        return (
          <AdminDashboardView
            stats={stats}
            users={users}
            recentActivity={recentActivity}
            formatDate={formatDate}
          />
        );
    }
  };

  // ===========================
  // RENDER PRINCIPAL
  // ===========================
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ✅ SIDEBAR MODULAR */}
      <AdminSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        currentView={currentView}
        setCurrentView={setCurrentView}
        stats={stats}
      />

      {/* ✅ CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col">
        {/* ✅ NAVBAR MODULAR */}
        <AdminNavbar
          currentView={currentView}
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          handleLogout={handleLogout}
        />

        {/* ✅ ÁREA DE CONTENIDO - VISTA ACTUAL */}
        <main className="flex-1 p-6">{renderCurrentView()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
