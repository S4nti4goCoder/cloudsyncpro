import {
  X,
  FolderPlus,
  Folder,
  AlertCircle,
  Home,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import folderService from "../../services/folderService";

// Esquema de validación
const createFolderSchema = yup.object({
  name_folder: yup
    .string()
    .required("El nombre de la carpeta es obligatorio")
    .min(1, "El nombre debe tener al menos 1 carácter")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .matches(/^[^\/\\:*?"<>|]+$/, "El nombre contiene caracteres no válidos")
    .test(
      "not-reserved",
      "Este nombre está reservado por el sistema",
      function (value) {
        if (!value) return true;
        const reservedNames = [
          "CON",
          "PRN",
          "AUX",
          "NUL",
          "COM1",
          "COM2",
          "COM3",
          "COM4",
          "COM5",
          "COM6",
          "COM7",
          "COM8",
          "COM9",
          "LPT1",
          "LPT2",
          "LPT3",
          "LPT4",
          "LPT5",
          "LPT6",
          "LPT7",
          "LPT8",
          "LPT9",
        ];
        return !reservedNames.includes(value.toUpperCase());
      }
    )
    .test(
      "no-dots-spaces",
      "El nombre no puede empezar o terminar con espacios o puntos",
      function (value) {
        if (!value) return true;
        return (
          !value.startsWith(" ") &&
          !value.endsWith(" ") &&
          !value.startsWith(".") &&
          !value.endsWith(".")
        );
      }
    ),
});

const CreateFolderModal = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  currentPath = [],
  parentFolderId = null,
  existingFolders = [],
}) => {
  const [realTimeValidation, setRealTimeValidation] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    clearErrors,
  } = useForm({
    resolver: yupResolver(createFolderSchema),
    defaultValues: {
      name_folder: "",
    },
  });

  const folderName = watch("name_folder");

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
      if (typeof document !== "undefined") {
        document.body.style.overflow = "unset";
      }
    };
  }, [isOpen, onClose, isLoading]);

  // Reset form cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      reset({
        name_folder: "",
      });
      setRealTimeValidation(null);
    }
  }, [isOpen, reset]);

  // Validación en tiempo real
  useEffect(() => {
    if (folderName) {
      const validation = folderService.validateFolderName(folderName);
      setRealTimeValidation(validation);

      // Verificar si ya existe una carpeta con ese nombre
      if (validation.isValid && existingFolders.length > 0) {
        const nameExists = existingFolders.some(
          (folder) =>
            folder.name_folder.toLowerCase() === folderName.trim().toLowerCase()
        );

        if (nameExists) {
          setError("name_folder", {
            message: "Ya existe una carpeta con ese nombre en esta ubicación",
          });
        } else {
          clearErrors("name_folder");
        }
      }
    } else {
      setRealTimeValidation(null);
    }
  }, [folderName, existingFolders, setError, clearErrors]);

  const handleFormSubmit = async (data) => {
    // Validación final antes de enviar
    const validation = folderService.validateFolderName(data.name_folder);

    if (!validation.isValid) {
      setError("name_folder", { message: validation.errors[0] });
      return;
    }

    // Verificar nombres duplicados
    const nameExists = existingFolders.some(
      (folder) =>
        folder.name_folder.toLowerCase() ===
        data.name_folder.trim().toLowerCase()
    );

    if (nameExists) {
      setError("name_folder", {
        message: "Ya existe una carpeta con ese nombre en esta ubicación",
      });
      return;
    }

    // Llamar a la función de guardado
    onSave({
      name_folder: validation.sanitizedName,
      parent_folder_id: parentFolderId,
    });
  };

  // No renderizar hasta que el modal esté abierto
  if (!isOpen) return null;

  // Construir breadcrumbs para mostrar ubicación
  const buildLocationPath = () => {
    const path = [{ name: "Inicio", id: null }];
    if (currentPath && currentPath.length > 0) {
      path.push(...currentPath);
    }
    return path;
  };

  const locationPath = buildLocationPath();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 transition-opacity duration-300"
        onClick={!isLoading ? onClose : undefined}
        role="button"
        tabIndex={-1}
        aria-label="Cerrar modal"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mr-4">
              <FolderPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Nueva Carpeta
              </h3>
              <div className="text-sm text-gray-500">
                Crear carpeta en la ubicación actual
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          {/* Content */}
          <div className="p-6">
            {/* Current location */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                <Folder className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex items-center space-x-1 text-sm text-gray-600 min-w-0">
                  {locationPath.map((folder, index) => (
                    <div
                      key={folder.id || `root-${index}`}
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
                        {folder.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Folder name input */}
            <div className="mb-4">
              <label
                htmlFor="folder-name-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre de la carpeta
              </label>
              <input
                id="folder-name-input"
                type="text"
                {...register("name_folder")}
                disabled={isLoading}
                placeholder="Mi nueva carpeta"
                autoComplete="off"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.name_folder
                    ? "border-red-500 bg-red-50"
                    : realTimeValidation?.isValid === false
                    ? "border-red-500 bg-red-50"
                    : realTimeValidation?.isValid === true
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />

              {/* Error message */}
              {errors.name_folder && (
                <div className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name_folder.message}
                </div>
              )}

              {/* Real-time validation feedback */}
              {!errors.name_folder && realTimeValidation && (
                <div className="mt-2">
                  {realTimeValidation.isValid ? (
                    <div className="text-sm text-green-600 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Nombre válido
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {realTimeValidation.errors.map((error, index) => (
                        <div
                          key={index}
                          className="text-sm text-red-600 flex items-center"
                        >
                          <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Character count */}
              {folderName && (
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {folderName.length}/100 caracteres
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-blue-800 mb-1">
                    Consejos para nombres de carpetas
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>• Usa nombres descriptivos y claros</div>
                    <div>
                      • Evita caracteres especiales: / \ : * ? " &lt; &gt; |
                    </div>
                    <div>• No uses nombres reservados del sistema</div>
                    <div>• Máximo 100 caracteres</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                !realTimeValidation?.isValid ||
                !!errors.name_folder
              }
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[140px] justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Crear Carpeta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
