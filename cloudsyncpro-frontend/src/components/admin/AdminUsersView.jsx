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
  Shield,
} from "lucide-react";
import { useState } from "react";
import DeleteConfirmModal from "../ui/DeleteConfirmModal";

const AdminUsersView = ({
  users,
  usersPagination,
  userFilters,
  setUserFilters,
  handleUserAction,
  formatDate,
  loadUsers,
}) => {
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    user: null,
    isLoading: false,
  });

  const confirmDeleteUser = (user) => {
    setDeleteModal({
      isOpen: true,
      user: user,
      isLoading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    try {
      await handleUserAction(deleteModal.user.id_user, "delete");
      setDeleteModal({ isOpen: false, user: null, isLoading: false });
    } catch (error) {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteModal.isLoading) {
      setDeleteModal({ isOpen: false, user: null, isLoading: false });
    }
  };
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
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <button className="flex items-center px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors text-sm font-medium cursor-pointer">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent cursor-text"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={userFilters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent cursor-pointer"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent cursor-pointer"
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
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-lg font-semibold">
                          {user.name_user?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="font-semibold text-gray-900 text-base">
                            {user.name_user}
                          </p>
                          {user.id_user === currentUser?.id_user && (
                            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>
                              Tú
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Mail className="w-4 h-4 mr-2" />
                          {user.email_user}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${getRoleBadge(
                        user.role_user
                      )}`}
                    >
                      {user.role_user === "admin" ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          Administrador
                        </>
                      ) : (
                        <>
                          <Users className="w-3 h-3 mr-1" />
                          Usuario
                        </>
                      )}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadge(
                        user.status_user
                      )}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          user.status_user === "active"
                            ? "bg-green-500"
                            : user.status_user === "banned"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      {user.status_user === "active"
                        ? "Activo"
                        : user.status_user === "banned"
                        ? "Baneado"
                        : "Inactivo"}
                    </span>
                  </td>

                  {/* Activity */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-200">
                        <FileText className="w-5 h-5 text-indigo-600 mr-2" />
                        <div>
                          <span className="text-sm font-semibold text-indigo-900">
                            {user.total_files || 0}
                          </span>
                          <span className="text-xs text-indigo-600 ml-1">
                            archivos
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center px-3 py-1.5 bg-yellow-50 rounded-lg border border-yellow-200">
                        <Folder className="w-5 h-5 text-yellow-600 mr-2" />
                        <div>
                          <span className="text-sm font-semibold text-yellow-900">
                            {user.total_folders || 0}
                          </span>
                          <span className="text-xs text-yellow-600 ml-1">
                            carpetas
                          </span>
                        </div>
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
                    <div className="flex items-center justify-end space-x-2">
                      {/* Quick Role Toggle */}
                      {user.id_user !== currentUser?.id_user ? (
                        <button
                          onClick={() =>
                            handleUserAction(
                              user.id_user,
                              "role",
                              user.role_user === "admin" ? "user" : "admin"
                            )
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            user.role_user === "admin"
                              ? "text-purple-600 hover:bg-purple-50"
                              : "text-blue-600 hover:bg-blue-50"
                          }`}
                          title={
                            user.role_user === "admin"
                              ? "Cambiar a Usuario"
                              : "Cambiar a Admin"
                          }
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="p-2 opacity-50">
                          <Shield className="w-4 h-4 text-gray-400" />
                        </div>
                      )}

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
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white cursor-pointer"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="banned">Baneado</option>
                      </select>

                      {/* Delete Button */}
                      {user.id_user !== currentUser?.id_user ? (
                        <button
                          onClick={() => confirmDeleteUser(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="p-2 opacity-50">
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </div>
                      )}

                      {/* More Options */}
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
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
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
          <button className="inline-flex items-center px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Crear primer usuario
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        userName={deleteModal.user?.name_user}
        userEmail={deleteModal.user?.email_user}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default AdminUsersView;
