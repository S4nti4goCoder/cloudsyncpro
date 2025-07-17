import {
  X,
  Upload,
  File,
  Image,
  FileText,
  Music,
  Video,
  Archive,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

const FileUploadZone = ({
  isOpen,
  onClose,
  onFilesSelected,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = [
    "image/*",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/*",
    "audio/*",
    "video/*",
  ],
  currentFolderId = null,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  // ✅ CORRECCIÓN: MOVER TODOS LOS HOOKS ANTES DEL RETURN CONDICIONAL
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !uploading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, uploading]);

  const getFileIcon = useCallback((file) => {
    const type = file.type;

    if (type.startsWith("image/")) return Image;
    if (type.includes("pdf")) return FileText;
    if (type.includes("word") || type.includes("document")) return FileText;
    if (type.includes("sheet") || type.includes("excel")) return FileText;
    if (type.includes("presentation") || type.includes("powerpoint"))
      return FileText;
    if (type.startsWith("audio/")) return Music;
    if (type.startsWith("video/")) return Video;
    if (type.includes("zip") || type.includes("rar")) return Archive;

    return File;
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const validateFile = useCallback(
    (file) => {
      const errors = [];

      if (file.size > maxFileSize) {
        errors.push(
          `El archivo es muy grande (máximo ${formatFileSize(maxFileSize)})`
        );
      }

      const isValidType = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        errors.push("Tipo de archivo no permitido");
      }

      return errors;
    },
    [maxFileSize, acceptedTypes, formatFileSize]
  );

  const handleFiles = useCallback(
    (files) => {
      const fileArray = Array.from(files);

      if (selectedFiles.length + fileArray.length > maxFiles) {
        alert(`Solo puedes subir un máximo de ${maxFiles} archivos`);
        return;
      }

      const validFiles = fileArray.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        errors: validateFile(file),
        status: "pending",
      }));

      setSelectedFiles((prev) => [...prev, ...validFiles]);
    },
    [selectedFiles.length, maxFiles, validateFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e) => {
      const files = e.target.files;
      if (files) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback((fileId) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const handleUpload = useCallback(async () => {
    const validFiles = selectedFiles.filter((f) => f.errors.length === 0);

    if (validFiles.length === 0) {
      alert("No hay archivos válidos para subir");
      return;
    }

    setUploading(true);

    for (const fileObj of validFiles) {
      setUploadProgress((prev) => ({ ...prev, [fileObj.id]: 0 }));

      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setUploadProgress((prev) => ({ ...prev, [fileObj.id]: progress }));
      }

      setSelectedFiles((prev) =>
        prev.map((f) => (f.id === fileObj.id ? { ...f, status: "success" } : f))
      );
    }

    setUploading(false);

    if (onFilesSelected) {
      onFilesSelected(
        validFiles.map((f) => f.file),
        currentFolderId
      );
    }

    setTimeout(() => {
      onClose();
      setSelectedFiles([]);
      setUploadProgress({});
    }, 1000);
  }, [selectedFiles, onFilesSelected, currentFolderId, onClose]);

  const clearAll = useCallback(() => {
    setSelectedFiles([]);
    setUploadProgress({});
  }, []);

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget && !uploading) {
        onClose();
      }
    },
    [uploading, onClose]
  );

  // ✅ DESPUÉS DE TODOS LOS HOOKS, AHORA SÍ EL RETURN CONDICIONAL
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(2px)",
      }}
      onClick={handleOverlayClick}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Subir Archivos
              </h3>
              <p className="text-sm text-gray-500">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload
              className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                isDragOver ? "text-blue-500" : "text-gray-400"
              }`}
            />

            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {isDragOver
                ? "Suelta los archivos aquí"
                : "Arrastra archivos aquí"}
            </h4>

            <p className="text-gray-500 mb-4">
              o haz clic para seleccionar archivos desde tu computadora
            </p>

            <div className="text-xs text-gray-400 space-y-1">
              <p>
                Máximo {maxFiles} archivos • Tamaño máximo{" "}
                {formatFileSize(maxFileSize)}
              </p>
              <p>Tipos permitidos: Imágenes, PDFs, Documentos, Audio, Video</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(",")}
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Archivos seleccionados ({selectedFiles.length})
                </h4>
                {!uploading && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedFiles.map((fileObj) => {
                  const Icon = getFileIcon(fileObj.file);
                  const progress = uploadProgress[fileObj.id] || 0;

                  return (
                    <div
                      key={fileObj.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Icon className="w-8 h-8 text-blue-500 flex-shrink-0" />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {fileObj.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileObj.file.size)}
                        </p>

                        {fileObj.status === "uploading" && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs">
                              <span>Subiendo...</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {fileObj.errors.length > 0 && (
                          <div className="mt-1">
                            {fileObj.errors.map((error, index) => (
                              <p
                                key={index}
                                className="text-xs text-red-600 flex items-center"
                              >
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {error}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        {fileObj.status === "success" && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {fileObj.status === "uploading" && (
                          <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                        )}
                        {fileObj.status === "pending" && !uploading && (
                          <button
                            onClick={() => removeFile(fileObj.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedFiles.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedFiles.filter((f) => f.errors.length === 0).length} de{" "}
                {selectedFiles.length} archivos válidos
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  disabled={uploading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={
                    uploading ||
                    selectedFiles.filter((f) => f.errors.length === 0)
                      .length === 0
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Archivos
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadZone;
