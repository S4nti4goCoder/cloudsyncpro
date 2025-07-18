import {
  Plus,
  Search,
  Download,
  Trash2,
  Edit,
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
import EditUserModal from "../ui/EditUserModal";
import RoleChangeConfirmModal from "../ui/RoleChangeConfirmModal";
import StatusChangeConfirmModal from "../ui/StatusChangeConfirmModal";
import CreateUserModal from "../ui/CreateUserModal";

// 🎯 COMPONENTES EXTRAÍDOS
const UserAvatar = ({ user, currentUser }) => (
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
);

const RoleBadge = ({ role }) => {
  const config = {
    admin: {
      styles: "bg-purple-100 text-purple-800 border-purple-200",
      icon: Shield,
      text: "Administrador",
    },
    user: {
      styles: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Users,
      text: "Usuario",
    },
  };

  const { styles, icon: Icon, text } = config[role] || config.user;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${styles}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {text}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    active: {
      styles: "bg-green-100 text-green-800 border-green-200",
      dotColor: "bg-green-500",
      text: "Activo",
    },
    banned: {
      styles: "bg-red-100 text-red-800 border-red-200",
      dotColor: "bg-red-500",
      text: "Baneado",
    },
    inactive: {
      styles: "bg-gray-100 text-gray-800 border-gray-200",
      dotColor: "bg-gray-500",
      text: "Inactivo",
    },
  };

  const { styles, dotColor, text } = config[status] || config.inactive;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${styles}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`}></div>
      {text}
    </span>
  );
};

const ActivityStats = ({ user }) => (
  <div className="flex items-center space-x-4">
    <div className="flex items-center px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-200">
      <FileText className="w-5 h-5 text-indigo-600 mr-2" />
      <div>
        <span className="text-sm font-semibold text-indigo-900">
          {user.total_files || 0}
        </span>
        <span className="text-xs text-indigo-600 ml-1">archivos</span>
      </div>
    </div>
    <div className="flex items-center px-3 py-1.5 bg-yellow-50 rounded-lg border border-yellow-200">
      <Folder className="w-5 h-5 text-yellow-600 mr-2" />
      <div>
        <span className="text-sm font-semibold text-yellow-900">
          {user.total_folders || 0}
        </span>
        <span className="text-xs text-yellow-600 ml-1">carpetas</span>
      </div>
    </div>
  </div>
);

const UserActions = ({
  user,
  currentUser,
  handleUserAction,
  openEditModal,
  confirmDeleteUser,
  openRoleChangeModal,
  openStatusChangeModal,
}) => {
  const isCurrentUser = user.id_user === currentUser?.id_user;

  return (
    <div className="flex items-center justify-center space-x-2">
      <select
        value={user.role_user}
        onChange={(e) => {
          if (e.target.value !== user.role_user) {
            openRoleChangeModal(user, e.target.value);
          }
        }}
        disabled={isCurrentUser}
        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white cursor-pointer min-w-[110px]"
      >
        <option value="user">Usuario</option>
        <option value="admin">Administrador</option>
      </select>

      <select
        value={user.status_user}
        onChange={(e) => {
          if (e.target.value !== user.status_user) {
            openStatusChangeModal(user, e.target.value);
          }
        }}
        disabled={isCurrentUser}
        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white cursor-pointer min-w-[100px]"
      >
        <option value="active">Activo</option>
        <option value="inactive">Inactivo</option>
        <option value="banned">Baneado</option>
      </select>

      <button
        onClick={() => openEditModal(user)}
        className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
        title="Editar usuario"
      >
        <Edit className="w-4 h-4" />
      </button>

      {!isCurrentUser ? (
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
    </div>
  );
};

const SearchFilters = ({ userFilters, handleSearch, handleFilterChange }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {[
        {
          key: "role",
          options: [
            { value: "", label: "Todos los roles" },
            { value: "admin", label: "Administradores" },
            { value: "user", label: "Usuarios" },
          ],
        },
        {
          key: "status",
          options: [
            { value: "", label: "Todos los estados" },
            { value: "active", label: "Activos" },
            { value: "inactive", label: "Inactivos" },
            { value: "banned", label: "Baneados" },
          ],
        },
      ].map(({ key, options }) => (
        <div key={key}>
          <select
            value={userFilters[key]}
            onChange={(e) => handleFilterChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent cursor-pointer"
          >
            {options.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = ({ userFilters, openCreateModal }) => (
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
    <button
      onClick={openCreateModal}
      className="inline-flex items-center px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors cursor-pointer"
    >
      <Plus className="w-4 h-4 mr-2" />
      Crear primer usuario
    </button>
  </div>
);

// 🎯 COMPONENTE PRINCIPAL
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
  const [editModal, setEditModal] = useState({
    isOpen: false,
    user: null,
    isLoading: false,
  });
  const [roleChangeModal, setRoleChangeModal] = useState({
    isOpen: false,
    user: null,
    newRole: null,
    isLoading: false,
  });
  const [statusChangeModal, setStatusChangeModal] = useState({
    isOpen: false,
    user: null,
    newStatus: null,
    isLoading: false,
  });
  const [createModal, setCreateModal] = useState({
    isOpen: false,
    isLoading: false,
  });

  // 🔧 HANDLERS
  const confirmDeleteUser = (user) =>
    setDeleteModal({ isOpen: true, user, isLoading: false });
  const openEditModal = (user) =>
    setEditModal({ isOpen: true, user, isLoading: false });

  const openRoleChangeModal = (user, newRole) => {
    setRoleChangeModal({
      isOpen: true,
      user,
      newRole,
      isLoading: false,
    });
  };

  const openStatusChangeModal = (user, newStatus) => {
    setStatusChangeModal({
      isOpen: true,
      user,
      newStatus,
      isLoading: false,
    });
  };

  const openCreateModal = () => {
    setCreateModal({ isOpen: true, isLoading: false });
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

  const handleEditSave = async (formData) => {
    setEditModal((prev) => ({ ...prev, isLoading: true }));
    try {
      const promises = [];
      if (formData.role_user !== editModal.user.role_user) {
        promises.push(
          handleUserAction(editModal.user.id_user, "role", formData.role_user)
        );
      }
      if (formData.status_user !== editModal.user.status_user) {
        promises.push(
          handleUserAction(
            editModal.user.id_user,
            "status",
            formData.status_user
          )
        );
      }
      await Promise.all(promises);
      setEditModal({ isOpen: false, user: null, isLoading: false });
    } catch (error) {
      setEditModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleRoleChangeConfirm = async () => {
    setRoleChangeModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await handleUserAction(
        roleChangeModal.user.id_user,
        "role",
        roleChangeModal.newRole
      );
      setRoleChangeModal({
        isOpen: false,
        user: null,
        newRole: null,
        isLoading: false,
      });
    } catch (error) {
      setRoleChangeModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleStatusChangeConfirm = async () => {
    setStatusChangeModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await handleUserAction(
        statusChangeModal.user.id_user,
        "status",
        statusChangeModal.newStatus
      );
      setStatusChangeModal({
        isOpen: false,
        user: null,
        newStatus: null,
        isLoading: false,
      });
    } catch (error) {
      setStatusChangeModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleCreateUser = async (userData) => {
    setCreateModal((prev) => ({ ...prev, isLoading: true }));

    try {
      await handleUserAction("create", "create", userData);
      setCreateModal({ isOpen: false, isLoading: false });
    } catch (error) {
      setCreateModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleExportUsers = () => {
    try {
      const exportData = users.map((user) => ({
        nombre: user.name_user,
        email: user.email_user,
        rol: user.role_user,
        estado: user.status_user,
        archivos: user.total_files || 0,
        carpetas: user.total_folders || 0,
        registrado: formatDate(user.created_at_user),
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `usuarios-${
        new Date().toISOString().split("T")[0]
      }.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error("Error exportando usuarios:", error);
    }
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
          <button
            onClick={handleExportUsers}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors text-sm font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Filters */}
      <SearchFilters
        userFilters={userFilters}
        handleSearch={handleSearch}
        handleFilterChange={handleFilterChange}
      />

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Usuario",
                  "Rol",
                  "Estado",
                  "Actividad",
                  "Registrado",
                  "Acciones",
                ].map((header, index) => (
                  <th
                    key={header}
                    className={`py-4 px-6 font-medium text-gray-900 text-sm ${
                      index === 5 ? "text-center" : "text-left"
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id_user}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <UserAvatar user={user} currentUser={currentUser} />
                  </td>
                  <td className="py-4 px-6">
                    <RoleBadge role={user.role_user} />
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={user.status_user} />
                  </td>
                  <td className="py-4 px-6">
                    <ActivityStats user={user} />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(user.created_at_user)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <UserActions
                      user={user}
                      currentUser={currentUser}
                      handleUserAction={handleUserAction}
                      openEditModal={openEditModal}
                      confirmDeleteUser={confirmDeleteUser}
                      openRoleChangeModal={openRoleChangeModal}
                      openStatusChangeModal={openStatusChangeModal}
                    />
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
                  {(usersPagination.currentPage - 1) * 5 + 1}{" "}
                  {/* ⭐ CAMBIADO DE 10 A 5 */}
                </span>{" "}
                a{" "}
                <span className="font-medium">
                  {Math.min(
                    usersPagination.currentPage * 5, // ⭐ CAMBIADO DE 10 A 5
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

                {/* ⭐ NUEVO: Números de página */}
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: usersPagination.totalPages },
                    (_, i) => i + 1
                  )
                    .slice(
                      Math.max(0, usersPagination.currentPage - 3),
                      Math.min(
                        usersPagination.totalPages,
                        usersPagination.currentPage + 2
                      )
                    )
                    .map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                          pageNum === usersPagination.currentPage
                            ? "bg-[#061a4a] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                </div>

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
        <EmptyState
          userFilters={userFilters}
          openCreateModal={openCreateModal}
        />
      )}

      {/* Modals */}
      <EditUserModal
        isOpen={editModal.isOpen}
        onClose={() =>
          !editModal.isLoading &&
          setEditModal({ isOpen: false, user: null, isLoading: false })
        }
        onSave={handleEditSave}
        user={editModal.user}
        isLoading={editModal.isLoading}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          !deleteModal.isLoading &&
          setDeleteModal({ isOpen: false, user: null, isLoading: false })
        }
        onConfirm={handleDeleteConfirm}
        userName={deleteModal.user?.name_user}
        userEmail={deleteModal.user?.email_user}
        isLoading={deleteModal.isLoading}
      />

      <RoleChangeConfirmModal
        isOpen={roleChangeModal.isOpen}
        onClose={() =>
          !roleChangeModal.isLoading &&
          setRoleChangeModal({
            isOpen: false,
            user: null,
            newRole: null,
            isLoading: false,
          })
        }
        onConfirm={handleRoleChangeConfirm}
        user={roleChangeModal.user}
        newRole={roleChangeModal.newRole}
        isLoading={roleChangeModal.isLoading}
      />

      <StatusChangeConfirmModal
        isOpen={statusChangeModal.isOpen}
        onClose={() =>
          !statusChangeModal.isLoading &&
          setStatusChangeModal({
            isOpen: false,
            user: null,
            newStatus: null,
            isLoading: false,
          })
        }
        onConfirm={handleStatusChangeConfirm}
        user={statusChangeModal.user}
        newStatus={statusChangeModal.newStatus}
        isLoading={statusChangeModal.isLoading}
      />

      <CreateUserModal
        isOpen={createModal.isOpen}
        onClose={() =>
          !createModal.isLoading &&
          setCreateModal({ isOpen: false, isLoading: false })
        }
        onSave={handleCreateUser}
        isLoading={createModal.isLoading}
      />
    </div>
  );
};

export default AdminUsersView;
