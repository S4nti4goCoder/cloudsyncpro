import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  Calendar,
  FileText,
  Folder,
} from "lucide-react";

const AdminUsersView = ({
  users,
  usersPagination,
  userFilters,
  setUserFilters,
  handleUserAction,
  formatDate,
  loadUsers,
}) => {
  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-200",
      banned: "bg-red-100 text-red-800 border-red-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[status] || styles.inactive;
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: "bg-purple-100 text-purple-800 border-purple-200",
      user: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return styles[role] || styles.user;
  };

  const handleSearch = (searchTerm) => {
    const newFilters = { ...userFilters, search: searchTerm, page: 1 };
    setUserFilters(newFilters);
    loadUsers(newFilters);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...userFilters, [filterType]: value, page: 1 };
    setUserFilters(newFilters);
    loadUsers(newFilters);
  };

  const handlePageChange = (newPage) => {
    const newFilters = { ...userFilters, page: newPage };
    setUserFilters(newFilters);
    loadUsers(newFilters);
  };

  const currentUser = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestión de Usuarios
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {usersPagination.totalUsers || 0} usuarios registrados
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <button className="flex items-center px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={userFilters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={userFilters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="user">Usuarios</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={userFilters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="banned">Baneados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900 text-sm">
                  Usuario
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 text-sm">
                  Rol
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 text-sm">
                  Estado
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 text-sm">
                  Actividad
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 text-sm">
                  Registrado
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 text-sm">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id_user}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* User Info */}
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#061a4a] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name_user?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">
                          {user.name_user}
                          {user.id_user === currentUser?.id_user && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Tú
                            </span>
                          )}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email_user}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadge(
                        user.role_user
                      )}`}
                    >
                      {user.role_user === "admin" ? "Administrador" : "Usuario"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(
                        user.status_user
                      )}`}
                    >
                      {user.status_user === "active"
                        ? "Activo"
                        : user.status_user === "banned"
                        ? "Baneado"
                        : "Inactivo"}
                    </span>
                  </td>

                  {/* Activity */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        <span>{user.total_files || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <Folder className="w-4 h-4 mr-1" />
                        <span>{user.total_folders || 0}</span>
                      </div>
                    </div>
                  </td>

                  {/* Registration Date */}
                  <td className="py-4 px-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(user.created_at_user)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {/* Role Selector */}
                      <select
                        value={user.role_user}
                        onChange={(e) =>
                          handleUserAction(user.id_user, "role", e.target.value)
                        }
                        disabled={user.id_user === currentUser?.id_user}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#061a4a] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Admin</option>
                      </select>

                      {/* Status Selector */}
                      <select
                        value={user.status_user}
                        onChange={(e) =>
                          handleUserAction(
                            user.id_user,
                            "status",
                            e.target.value
                          )
                        }
                        disabled={user.id_user === currentUser?.id_user}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#061a4a] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="banned">Baneado</option>
                      </select>

                      {/* Delete Button */}
                      {user.id_user !== currentUser?.id_user && (
                        <button
                          onClick={() =>
                            handleUserAction(user.id_user, "delete")
                          }
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* More Options */}
                      <button className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersPagination && usersPagination.totalPages > 1 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando{" "}
                <span className="font-medium">
                  {(usersPagination.currentPage - 1) * 10 + 1}
                </span>{" "}
                a{" "}
                <span className="font-medium">
                  {Math.min(
                    usersPagination.currentPage * 10,
                    usersPagination.totalUsers
                  )}
                </span>{" "}
                de{" "}
                <span className="font-medium">
                  {usersPagination.totalUsers}
                </span>{" "}
                usuarios
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handlePageChange(usersPagination.currentPage - 1)
                  }
                  disabled={!usersPagination.hasPrev}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </button>

                <span className="text-sm text-gray-700">
                  Página {usersPagination.currentPage} de{" "}
                  {usersPagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    handlePageChange(usersPagination.currentPage + 1)
                  }
                  disabled={!usersPagination.hasNext}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron usuarios
          </h3>
          <p className="text-gray-500 mb-6">
            {userFilters.search || userFilters.role || userFilters.status
              ? "Intenta ajustar los filtros de búsqueda"
              : "Aún no hay usuarios registrados en el sistema"}
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Crear primer usuario
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsersView;
