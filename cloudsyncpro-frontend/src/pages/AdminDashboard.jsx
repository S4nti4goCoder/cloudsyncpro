import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../services/authService";
import api from "../services/api";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Activity,
  Database,
  Folder,
  FileText,
  Clock,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreVertical,
  Settings,
  LogOut,
  Menu,
  Home,
  Bell,
} from "lucide-react";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [userFilters, setUserFilters] = useState({
    search: "",
    role: "",
    status: "",
    page: 1,
  });
  const [usersPagination, setUsersPagination] = useState({});
  const navigate = useNavigate();

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      banned: "bg-red-100 text-red-800",
      inactive: "bg-gray-100 text-gray-800",
    };
    return styles[status] || styles.inactive;
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: "bg-purple-100 text-purple-800",
      user: "bg-blue-100 text-blue-800",
    };
    return styles[role] || styles.user;
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#061a4a] rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="ml-3 font-semibold text-gray-900">
                Admin Panel
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 cursor-pointer ${
              currentView === "dashboard"
                ? "bg-[#061a4a]/10 text-[#061a4a] border border-[#061a4a]/20"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3">Dashboard</span>}
          </button>

          <button
            onClick={() => setCurrentView("users")}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 cursor-pointer ${
              currentView === "users"
                ? "bg-[#061a4a]/10 text-[#061a4a] border border-[#061a4a]/20"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <>
                <span className="ml-3 flex-1 text-left">Usuarios</span>
                <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {stats?.users?.total_users || 0}
                </span>
              </>
            )}
          </button>

          <button
            onClick={() => setCurrentView("activity")}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 cursor-pointer ${
              currentView === "activity"
                ? "bg-[#061a4a]/10 text-[#061a4a] border border-[#061a4a]/20"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Activity className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3">Actividad</span>}
          </button>
        </nav>

        {/* Settings */}
        <div className="p-2 border-t border-gray-100">
          <button className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors">
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3">Configuración</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentView === "dashboard" && "Panel de Administración"}
                {currentView === "users" && "Gestión de Usuarios"}
                {currentView === "activity" && "Actividad del Sistema"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Admin: <span className="font-medium">{user?.name_user}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {currentView === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Usuarios
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.users?.total_users || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Usuarios Activos
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.users?.active_users || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Administradores
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.users?.total_admins || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Activity className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Sesiones Activas
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.sessions?.active_sessions || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Usuarios Recientes
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user) => (
                      <div
                        key={user.id_user}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {user.name_user}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email_user}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(
                              user.role_user
                            )}`}
                          >
                            {user.role_user}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                              user.status_user
                            )}`}
                          >
                            {user.status_user}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === "users" && (
            <div className="space-y-6">
              {/* Users Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Gestión de Usuarios
                  </h2>
                  <p className="text-sm text-gray-600">
                    Total: {usersPagination.totalUsers || 0} usuarios
                  </p>
                </div>
                <button className="px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors cursor-pointer">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Nuevo Usuario
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Usuario
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Rol
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Estado
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Archivos
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Registrado
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr
                            key={user.id_user}
                            className="border-b border-gray-100"
                          >
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {user.name_user}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {user.email_user}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(
                                  user.role_user
                                )}`}
                              >
                                {user.role_user}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                                  user.status_user
                                )}`}
                              >
                                {user.status_user}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">
                                {user.total_files || 0}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">
                                {formatDate(user.created_at_user)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <select
                                  value={user.role_user}
                                  onChange={(e) =>
                                    handleUserAction(
                                      user.id_user,
                                      "role",
                                      e.target.value
                                    )
                                  }
                                  className="text-xs border border-gray-300 rounded px-2 py-1 cursor-pointer"
                                  disabled={
                                    user.id_user ===
                                    JSON.parse(localStorage.getItem("user"))
                                      ?.id_user
                                  }
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <select
                                  value={user.status_user}
                                  onChange={(e) =>
                                    handleUserAction(
                                      user.id_user,
                                      "status",
                                      e.target.value
                                    )
                                  }
                                  className="text-xs border border-gray-300 rounded px-2 py-1 cursor-pointer"
                                  disabled={
                                    user.id_user ===
                                    JSON.parse(localStorage.getItem("user"))
                                      ?.id_user
                                  }
                                >
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                  <option value="banned">Banned</option>
                                </select>
                                {user.id_user !==
                                  JSON.parse(localStorage.getItem("user"))
                                    ?.id_user && (
                                  <button
                                    onClick={() =>
                                      handleUserAction(user.id_user, "delete")
                                    }
                                    className="p-1 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === "activity" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Actividad Reciente del Sistema
              </h2>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            Nuevo usuario registrado: {activity.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
