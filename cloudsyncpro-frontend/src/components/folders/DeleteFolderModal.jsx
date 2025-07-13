import {
  X,
  Trash2,
  Folder,
  AlertTriangle,
  ChevronRight,
  File,
  FolderOpen,
} from "lucide-react";
import { useEffect } from "react";

const DeleteFolderModal = ({
  isOpen,
  onClose,
  onConfirm,
  folder,
  isLoading = false,
  currentPath = [],
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

  if (!isOpen || !folder) return null;

  // Construir breadcrumbs para mostrar ubicación
  const buildLocationPath = () => {
    const path = [{ name: "Inicio", id: null }];
    if (currentPath && currentPath.length > 0) {
      path.push(...currentPath);
    }
    return path;
  };

  const locationPath = buildLocationPath();
  const hasContent = folder.subfolders_count > 0 || folder.files_count > 0;
  const isCurrentUser = true; // TODO: Verificar si es el propietario

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
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mr-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Eliminar Carpeta
              </h3>
              <p className="text-sm text-gray-500">
                Esta acción no se puede deshacer
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
            ¿Estás seguro de que quieres eliminar esta carpeta?
            {hasContent && " Todo su contenido también será eliminado."}
          </p>

          {/* Folder Info Card */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-semibold text-gray-900 text-lg">
                  {folder.name_folder}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <FolderOpen className="w-4 h-4 mr-1" />
                    {folder.subfolders_count || 0} carpetas
                  </span>
                  <span className="flex items-center">
                    <File className="w-4 h-4 mr-1" />
                    {folder.files_count || 0} archivos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location info */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
              <Folder className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <div className="flex items-center space-x-1 text-sm text-gray-600 min-w-0">
                {locationPath.map((pathFolder, index) => (
                  <div
                    key={pathFolder.id || "root"}
                    className="flex items-center"
                  >
                    {index > 0 && (
                      <ChevronRight className="w-3 h-3 mx-1 text-gray-400 flex-shrink-0" />
                    )}
                    <span
                      className={`${
                        index === locationPath.length - 1
                          ? "font-medium text-gray-900"
                          : ""
                      } truncate`}
                    >
                      {pathFolder.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content warning */}
          {hasContent && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 mb-1">
                    ¡Atención! Esta carpeta contiene archivos
                  </p>
                  <div className="text-sm text-red-700 space-y-1">
                    <p>
                      • <strong>{folder.subfolders_count || 0}</strong>{" "}
                      subcarpetas serán eliminadas
                    </p>
                    <p>
                      • <strong>{folder.files_count || 0}</strong> archivos
                      serán eliminados permanentemente
                    </p>
                    <p>
                      • Esta acción <strong>no se puede deshacer</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty folder notice */}
          {!hasContent && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <Folder className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Carpeta vacía
                  </p>
                  <p className="text-sm text-blue-700">
                    Esta carpeta no contiene archivos ni subcarpetas, por lo que
                    es segura de eliminar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Owner verification */}
          {folder.owner_name && !isCurrentUser && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Carpeta de otro usuario
                  </p>
                  <p className="text-sm text-yellow-700">
                    Esta carpeta pertenece a{" "}
                    <strong>{folder.owner_name}</strong>. Como administrador,
                    puedes eliminarla, pero considera notificar al propietario.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Final warning */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">
                  Confirmación requerida
                </p>
                <p className="text-sm text-gray-700">
                  Una vez eliminada, no podrás recuperar esta carpeta ni su
                  contenido. Asegúrate de tener copias de seguridad si es
                  necesario.
                </p>
              </div>
            </div>
          </div>
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
            className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[140px] justify-center cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                {hasContent ? "Eliminar Todo" : "Eliminar Carpeta"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFolderModal;
