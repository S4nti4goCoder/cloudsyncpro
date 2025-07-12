import { Shield, X, AlertTriangle, Users } from "lucide-react";
import { useEffect } from "react";

const RoleChangeConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  newRole,
  isLoading = false,
}) => {
  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen || !user) return null;

  const getRoleInfo = (role) => {
    const roles = {
      admin: {
        name: "Administrador",
        description: "Acceso completo al sistema",
        icon: Shield,
        color: "purple",
        permissions: [
          "Gestionar todos los usuarios",
          "Ver estadísticas del sistema",
          "Acceder a configuraciones",
          "Realizar backups",
          "Ver actividad completa",
        ],
      },
      user: {
        name: "Usuario",
        description: "Acceso estándar al sistema",
        icon: Users,
        color: "blue",
        permissions: [
          "Gestionar sus propios archivos",
          "Crear y organizar carpetas",
          "Compartir documentos",
          "Ver su actividad personal",
        ],
      },
    };
    return roles[role] || roles.user;
  };

  const currentRoleInfo = getRoleInfo(user.role_user);
  const newRoleInfo = getRoleInfo(newRole);
  const isUpgrade = newRole === "admin";
  const isDowngrade = newRole === "user";

  const CurrentIcon = currentRoleInfo.icon;
  const NewIcon = newRoleInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 transition-opacity duration-300 cursor-pointer"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-12 h-12 ${
                isUpgrade ? "bg-purple-100" : "bg-blue-100"
              } rounded-full mr-4`}
            >
              <Shield
                className={`w-6 h-6 ${
                  isUpgrade ? "text-purple-600" : "text-blue-600"
                }`}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Cambiar Rol de Usuario
              </h3>
              <p className="text-sm text-gray-500">
                Confirmar cambio de permisos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6 text-base leading-relaxed">
            ¿Estás seguro de que quieres cambiar el rol de este usuario? Este
            cambio afectará inmediatamente sus permisos en el sistema.
          </p>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-semibold">
                  {user.name_user?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900 text-lg">
                  {user.name_user}
                </p>
                <p className="text-sm text-gray-600">{user.email_user}</p>
              </div>
            </div>
          </div>

          {/* Role Change Visual */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              {/* Current Role */}
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div
                    className={`p-3 bg-${currentRoleInfo.color}-100 rounded-full`}
                  >
                    <CurrentIcon
                      className={`w-6 h-6 text-${currentRoleInfo.color}-600`}
                    />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {currentRoleInfo.name}
                </p>
                <p className="text-xs text-gray-500">Rol actual</p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 mx-4">
                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <div className="w-0 h-0 border-l-4 border-l-gray-300 border-t-2 border-b-2 border-t-transparent border-b-transparent ml-1"></div>
                </div>
              </div>

              {/* New Role */}
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div
                    className={`p-3 bg-${newRoleInfo.color}-100 rounded-full`}
                  >
                    <NewIcon
                      className={`w-6 h-6 text-${newRoleInfo.color}-600`}
                    />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {newRoleInfo.name}
                </p>
                <p className="text-xs text-gray-500">Nuevo rol</p>
              </div>
            </div>
          </div>

          {/* Permissions Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Permisos del rol {newRoleInfo.name}:
            </h4>
            <ul className="space-y-2">
              {newRoleInfo.permissions.map((permission, index) => (
                <li
                  key={index}
                  className="flex items-center text-sm text-gray-600"
                >
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                  {permission}
                </li>
              ))}
            </ul>
          </div>

          {/* Warning for role changes */}
          {isUpgrade && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-purple-800 mb-1">
                    Promoción a Administrador
                  </p>
                  <p className="text-sm text-purple-700">
                    Este usuario tendrá acceso completo al sistema y podrá
                    gestionar otros usuarios.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isDowngrade && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-800 mb-1">
                    Degradación de Permisos
                  </p>
                  <p className="text-sm text-orange-700">
                    Este usuario perderá el acceso administrativo y solo podrá
                    gestionar sus propios archivos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 text-sm font-medium text-white border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[140px] justify-center cursor-pointer ${
              isUpgrade
                ? "bg-purple-600 border-purple-600 hover:bg-purple-700 focus:ring-purple-200"
                : "bg-blue-600 border-blue-600 hover:bg-blue-700 focus:ring-blue-200"
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Cambiando...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Confirmar Cambio
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleChangeConfirmModal;
