import { UserCheck, X, AlertTriangle, UserX, User } from "lucide-react";
import { useEffect } from "react";

const StatusChangeConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  newStatus,
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

  const getStatusInfo = (status) => {
    const statuses = {
      active: {
        name: "Activo",
        description: "Usuario con acceso completo al sistema",
        icon: UserCheck,
        color: "green",
        dotColor: "bg-green-500",
        permissions: [
          "Iniciar sesión en el sistema",
          "Acceder a todas sus funcionalidades",
          "Gestionar archivos y carpetas",
          "Compartir contenido",
          "Usar todas las características disponibles",
        ],
      },
      inactive: {
        name: "Inactivo",
        description: "Usuario temporalmente deshabilitado",
        icon: User,
        color: "gray",
        dotColor: "bg-gray-500",
        permissions: [
          "No puede iniciar sesión",
          "Acceso bloqueado temporalmente",
          "Sus archivos permanecen seguros",
          "Puede ser reactivado en cualquier momento",
        ],
      },
      banned: {
        name: "Baneado",
        description: "Usuario permanentemente bloqueado",
        icon: UserX,
        color: "red",
        dotColor: "bg-red-500",
        permissions: [
          "Acceso completamente denegado",
          "No puede iniciar sesión",
          "Todas las sesiones revocadas",
          "Requiere intervención administrativa",
        ],
      },
    };
    return statuses[status] || statuses.active;
  };

  const currentStatusInfo = getStatusInfo(user.status_user);
  const newStatusInfo = getStatusInfo(newStatus);
  const isActivation = newStatus === "active";
  const isDeactivation = newStatus === "inactive";
  const isBanning = newStatus === "banned";

  const CurrentIcon = currentStatusInfo.icon;
  const NewIcon = newStatusInfo.icon;

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
                isActivation
                  ? "bg-green-100"
                  : isDeactivation
                  ? "bg-gray-100"
                  : "bg-red-100"
              } rounded-full mr-4`}
            >
              <NewIcon
                className={`w-6 h-6 ${
                  isActivation
                    ? "text-green-600"
                    : isDeactivation
                    ? "text-gray-600"
                    : "text-red-600"
                }`}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Cambiar Estado de Usuario
              </h3>
              <p className="text-sm text-gray-500">
                Confirmar cambio de acceso
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
            ¿Estás seguro de que quieres cambiar el estado de este usuario? Este
            cambio afectará inmediatamente su acceso al sistema.
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

          {/* Status Change Visual */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              {/* Current Status */}
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div
                    className={`p-3 bg-${currentStatusInfo.color}-100 rounded-full`}
                  >
                    <CurrentIcon
                      className={`w-6 h-6 text-${currentStatusInfo.color}-600`}
                    />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {currentStatusInfo.name}
                </p>
                <p className="text-xs text-gray-500">Estado actual</p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 mx-4">
                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <div className="w-0 h-0 border-l-4 border-l-gray-300 border-t-2 border-b-2 border-t-transparent border-b-transparent ml-1"></div>
                </div>
              </div>

              {/* New Status */}
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div
                    className={`p-3 bg-${newStatusInfo.color}-100 rounded-full`}
                  >
                    <NewIcon
                      className={`w-6 h-6 text-${newStatusInfo.color}-600`}
                    />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {newStatusInfo.name}
                </p>
                <p className="text-xs text-gray-500">Nuevo estado</p>
              </div>
            </div>
          </div>

          {/* Status Effects */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Efectos del estado {newStatusInfo.name}:
            </h4>
            <ul className="space-y-2">
              {newStatusInfo.permissions.map((permission, index) => (
                <li
                  key={index}
                  className="flex items-center text-sm text-gray-600"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full mr-3 ${
                      isActivation
                        ? "bg-green-500"
                        : isDeactivation
                        ? "bg-gray-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  {permission}
                </li>
              ))}
            </ul>
          </div>

          {/* Warning for status changes */}
          {isActivation && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <UserCheck className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 mb-1">
                    Activación de Usuario
                  </p>
                  <p className="text-sm text-green-700">
                    El usuario recuperará el acceso completo al sistema y podrá
                    iniciar sesión inmediatamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isDeactivation && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Desactivación Temporal
                  </p>
                  <p className="text-sm text-yellow-700">
                    El usuario perderá el acceso temporalmente pero podrá ser
                    reactivado en cualquier momento.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isBanning && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 mb-1">
                    Baneo Permanente
                  </p>
                  <p className="text-sm text-red-700">
                    Se revocarán todas las sesiones activas del usuario y su
                    acceso será completamente bloqueado.
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
              isActivation
                ? "bg-green-600 border-green-600 hover:bg-green-700 focus:ring-green-200"
                : isDeactivation
                ? "bg-gray-600 border-gray-600 hover:bg-gray-700 focus:ring-gray-200"
                : "bg-red-600 border-red-600 hover:bg-red-700 focus:ring-red-200"
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Cambiando...
              </>
            ) : (
              <>
                <NewIcon className="w-4 h-4 mr-2" />
                Confirmar Cambio
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeConfirmModal;
