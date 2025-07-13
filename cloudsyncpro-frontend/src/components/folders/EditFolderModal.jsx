import { X, Edit, Folder, AlertCircle, Save, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import folderService from "../../services/folderService";

// Esquema de validación
const editFolderSchema = yup.object({
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

const EditFolderModal = ({
  isOpen,
  onClose,
  onSave,
  folder,
  isLoading = false,
  currentPath = [],
  existingFolders = [],
}) => {
  const [realTimeValidation, setRealTimeValidation] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    clearErrors,
    setValue,
  } = useForm({
    resolver: yupResolver(editFolderSchema),
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
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isLoading]);

  // Reset form cuando se abre el modal
  useEffect(() => {
    if (isOpen && folder) {
      reset();
      setValue("name_folder", folder.name_folder || "");
      setRealTimeValidation(null);
      setHasChanges(false);
    }
  }, [isOpen, folder, reset, setValue]);

  // Detectar cambios
  useEffect(() => {
    if (folder && folderName !== undefined) {
      setHasChanges(folderName.trim() !== folder.name_folder.trim());
    }
  }, [folderName, folder]);

  // Validación en tiempo real
  useEffect(() => {
    if (folderName && folder) {
      const validation = folderService.validateFolderName(folderName);
      setRealTimeValidation(validation);

      // Verificar si ya existe una carpeta con ese nombre (excluyendo la actual)
      if (validation.isValid && existingFolders.length > 0) {
        const nameExists = existingFolders.some(
          (f) =>
            f.id_folder !== folder.id_folder &&
            f.name_folder.toLowerCase() === folderName.trim().toLowerCase()
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
  }, [folderName, existingFolders, setError, clearErrors, folder]);

  const handleFormSubmit = async (data) => {
    if (!folder) return;

    // Validación final antes de enviar
    const validation = folderService.validateFolderName(data.name_folder);

    if (!validation.isValid) {
      setError("name_folder", { message: validation.errors[0] });
      return;
    }

    // Verificar nombres duplicados (excluyendo la carpeta actual)
    const nameExists = existingFolders.some(
      (f) =>
        f.id_folder !== folder.id_folder &&
        f.name_folder.toLowerCase() === data.name_folder.trim().toLowerCase()
    );

    if (nameExists) {
      setError("name_folder", {
        message: "Ya existe una carpeta con ese nombre en esta ubicación",
      });
      return;
    }

    // Solo enviar si hay cambios
    if (!hasChanges) {
      onClose();
      return;
    }

    // Llamar a la función de guardado
    onSave(folder.id_folder, {
      name_folder: validation.sanitizedName,
    });
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 transition-opacity duration-300 cursor-pointer"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mr-4">
              <Edit className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Renombrar Carpeta
              </h3>
              <p className="text-sm text-gray-500">
                Cambiar el nombre de la carpeta
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

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Content */}
          <div className="p-6">
            {/* Current folder info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center">
                <Folder className="w-8 h-8 text-blue-500 mr-3" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {folder.name_folder}
                  </h4>
                  <div className="text-sm text-gray-500 mt-1">
                    <span>{folder.subfolders_count || 0} carpetas</span>
                    <span className="mx-2">•</span>
                    <span>{folder.files_count || 0} archivos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current location */}
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

            {/* New folder name input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo nombre
              </label>
              <input
                type="text"
                {...register("name_folder")}
                disabled={isLoading}
                placeholder="Nuevo nombre de carpeta"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors cursor-text ${
                  errors.name_folder
                    ? "border-red-500 bg-red-50"
                    : realTimeValidation?.isValid === false
                    ? "border-red-500 bg-red-50"
                    : realTimeValidation?.isValid === true && hasChanges
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />

              {/* Error message */}
              {errors.name_folder && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name_folder.message}
                </p>
              )}

              {/* Real-time validation feedback */}
              {!errors.name_folder && realTimeValidation && (
                <div className="mt-2">
                  {realTimeValidation.isValid ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Nombre válido
                      </p>
                      {hasChanges && (
                        <span className="text-xs text-orange-600 font-medium">
                          Cambios pendientes
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {realTimeValidation.errors.map((error, index) => (
                        <p
                          key={index}
                          className="text-sm text-red-600 flex items-center"
                        >
                          <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* No changes indicator */}
              {!hasChanges && folderName && !errors.name_folder && (
                <p className="mt-1 text-sm text-gray-500 flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  Sin cambios
                </p>
              )}

              {/* Character count */}
              {folderName && (
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {folderName.length}/100 caracteres
                </div>
              )}
            </div>

            {/* Warning for folder with content */}
            {(folder.subfolders_count > 0 || folder.files_count > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      Carpeta con contenido
                    </p>
                    <p className="text-sm text-yellow-700">
                      Esta carpeta contiene {folder.subfolders_count || 0}{" "}
                      subcarpetas y {folder.files_count || 0} archivos. Cambiar
                      el nombre no afectará su contenido.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                !realTimeValidation?.isValid ||
                !!errors.name_folder ||
                !hasChanges
              }
              className="px-6 py-2.5 text-sm font-medium text-white bg-orange-600 border border-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[140px] justify-center cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFolderModal;
