import { useState, useCallback } from "react";
import { toast } from "sonner";
import fileService from "../services/fileService";

/**
 * Hook personalizado para manejar la subida de archivos
 * @param {Object} options - Opciones de configuración
 * @param {number|null} options.folderId - ID de carpeta destino
 * @param {Function} options.onSuccess - Callback ejecutado después de subida exitosa
 * @param {Function} options.onError - Callback ejecutado en caso de error
 * @returns {Object} - Estado y funciones para manejar la subida
 */
const useFileUpload = (options = {}) => {
  const { folderId = null, onSuccess = () => {}, onError = () => {} } = options;

  // Estados
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);

  /**
   * Validar archivos seleccionados
   * @param {FileList|File[]} files - Archivos a validar
   * @returns {Object} - Resultado de validación
   */
  const validateFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const errors = [];
    const validFiles = [];

    // Verificar límite de archivos
    if (fileArray.length > 10) {
      errors.push({
        type: "FILE_COUNT",
        message: "Máximo 10 archivos por subida",
      });
      return { isValid: false, errors, validFiles: [] };
    }

    fileArray.forEach((file, index) => {
      // Validar tipo de archivo
      const typeValidation = fileService.validateFileType(file);
      if (!typeValidation.isValid) {
        errors.push({
          type: "INVALID_TYPE",
          file: file.name,
          message: typeValidation.message,
        });
        return;
      }

      // Validar tamaño
      const sizeValidation = fileService.validateFileSize(file);
      if (!sizeValidation.isValid) {
        errors.push({
          type: "FILE_TOO_LARGE",
          file: file.name,
          message: sizeValidation.message,
        });
        return;
      }

      // Si pasa todas las validaciones, agregar a archivos válidos
      validFiles.push({
        file,
        id: `${file.name}-${file.size}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        category: typeValidation.category,
        formattedSize: fileService.formatFileSize(file.size),
        icon: fileService.getFileIcon(typeValidation.category),
        color: fileService.getFileColor(typeValidation.category),
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      validFiles,
    };
  }, []);

  /**
   * Manejar selección de archivos
   * @param {FileList|File[]} files - Archivos seleccionados
   */
  const handleFileSelection = useCallback(
    (files) => {
      if (!files || files.length === 0) {
        setSelectedFiles([]);
        setValidationErrors([]);
        return;
      }

      const validation = validateFiles(files);

      if (validation.isValid) {
        setSelectedFiles(validation.validFiles);
        setValidationErrors([]);
        toast.success(
          `${validation.validFiles.length} archivo(s) listo(s) para subir`
        );
      } else {
        setSelectedFiles(validation.validFiles);
        setValidationErrors(validation.errors);

        // Mostrar errores al usuario
        validation.errors.forEach((error) => {
          toast.error(error.message);
        });
      }
    },
    [validateFiles]
  );

  /**
   * Subir archivos seleccionados
   */
  const uploadFiles = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error("No hay archivos seleccionados para subir");
      return;
    }

    if (validationErrors.length > 0) {
      toast.error("Hay errores de validación que deben corregirse");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Extraer los objetos File de los archivos seleccionados
      const filesToUpload = selectedFiles.map((fileData) => fileData.file);

      // Callback de progreso
      const onProgress = (progress) => {
        setUploadProgress(progress);
      };

      // Subir archivos
      const result = await fileService.uploadFiles(
        filesToUpload,
        folderId,
        onProgress
      );

      if (result.success) {
        // Subida exitosa
        toast.success(result.message, {
          description: `${result.data.successful} archivo(s) subido(s) correctamente`,
          duration: 4000,
        });

        // Mostrar advertencias si las hay
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((warning) => {
            toast.warning(`${warning.filename}: ${warning.error}`);
          });
        }

        // Limpiar estado
        setSelectedFiles([]);
        setValidationErrors([]);
        setUploadProgress(0);

        // Ejecutar callback de éxito
        onSuccess(result.data);
      } else {
        // Error en la subida
        toast.error("Error al subir archivos", {
          description: result.message,
        });

        // Mostrar errores específicos
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((error) => {
            toast.error(error.message || error);
          });
        }

        // Ejecutar callback de error
        onError(result);
      }
    } catch (error) {
      console.error("Error durante la subida:", error);
      toast.error("Error inesperado durante la subida");
      onError(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFiles, validationErrors, folderId, onSuccess, onError]);

  /**
   * Cancelar subida y limpiar estado
   */
  const cancelUpload = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setSelectedFiles([]);
    setValidationErrors([]);
    toast.info("Subida cancelada");
  }, []);

  /**
   * Remover un archivo de la selección
   * @param {string} fileId - ID del archivo a remover
   */
  const removeFile = useCallback((fileId) => {
    setSelectedFiles((prev) => prev.filter((file) => file.id !== fileId));
    toast.info("Archivo removido de la selección");
  }, []);

  /**
   * Limpiar todos los archivos seleccionados
   */
  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
    setValidationErrors([]);
    toast.info("Selección de archivos limpiada");
  }, []);

  /**
   * Verificar si se puede subir (hay archivos válidos y no hay errores)
   */
  const canUpload =
    selectedFiles.length > 0 && validationErrors.length === 0 && !isUploading;

  return {
    // Estados
    isUploading,
    uploadProgress,
    selectedFiles,
    validationErrors,
    canUpload,

    // Funciones
    handleFileSelection,
    uploadFiles,
    cancelUpload,
    removeFile,
    clearFiles,

    // Estadísticas
    stats: {
      totalFiles: selectedFiles.length,
      totalSize: selectedFiles.reduce((acc, file) => acc + file.size, 0),
      totalSizeFormatted: fileService.formatFileSize(
        selectedFiles.reduce((acc, file) => acc + file.size, 0)
      ),
      hasErrors: validationErrors.length > 0,
      errorCount: validationErrors.length,
    },
  };
};

export default useFileUpload;
