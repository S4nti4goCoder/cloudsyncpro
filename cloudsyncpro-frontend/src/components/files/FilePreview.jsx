import {
  X,
  Download,
  Share,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Eye,
  FileText,
  Image as ImageIcon,
  Play,
  Music,
  Archive,
  File,
  Calendar,
  User,
  HardDrive,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const FilePreview = ({
  isOpen,
  onClose,
  file,
  files = [],
  onFileEdit,
  onFileDelete,
  onFileDownload,
  onFileShare,
  currentUser,
  formatDate,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Encontrar el archivo actual en la lista
  useEffect(() => {
    if (file && files.length > 0) {
      const index = files.findIndex((f) => f.id_file === file.id_file);
      setCurrentIndex(index !== -1 ? index : 0);
    }
  }, [file, files]);

  // Control del scroll del body
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

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Navegación con teclas
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen || files.length <= 1) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isOpen, files.length]);

  const currentFile = files[currentIndex] || file;

  const handlePrevious = useCallback(() => {
    if (files.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
    resetView();
  }, [files.length]);

  const handleNext = useCallback(() => {
    if (files.length <= 1) return;
    setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
    resetView();
  }, [files.length]);

  const resetView = useCallback(() => {
    setZoom(100);
    setRotation(0);
    setError(null);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 25, 300));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 25, 25));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const getFileIcon = useCallback((fileType) => {
    if (fileType.startsWith("image/")) return ImageIcon;
    if (fileType.includes("pdf")) return FileText;
    if (fileType.includes("document") || fileType.includes("text"))
      return FileText;
    if (fileType.startsWith("video/")) return Play;
    if (fileType.startsWith("audio/")) return Music;
    if (fileType.includes("zip") || fileType.includes("rar")) return Archive;
    return File;
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const isImage = currentFile?.type_file?.startsWith("image/");
  const isPDF = currentFile?.type_file?.includes("pdf");
  const isVideo = currentFile?.type_file?.startsWith("video/");
  const isAudio = currentFile?.type_file?.startsWith("audio/");
  const isDocument =
    currentFile?.type_file?.includes("document") ||
    currentFile?.type_file?.includes("text") ||
    currentFile?.type_file?.includes("spreadsheet") ||
    currentFile?.type_file?.includes("presentation");

  const canPreview = isImage || isPDF || isVideo || isAudio;

  if (!isOpen || !currentFile) return null;

  const FileIcon = getFileIcon(currentFile.type_file);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
      onClick={handleOverlayClick}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileIcon className="w-6 h-6" />
              <div>
                <h3 className="font-medium truncate max-w-64">
                  {currentFile.name_file}
                </h3>
                <p className="text-sm text-gray-300">
                  {formatFileSize(currentFile.size_file)} •{" "}
                  {formatDate(currentFile.created_at_file)}
                </p>
              </div>
            </div>

            {/* Navegación */}
            {files.length > 1 && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-300">
                  {currentIndex + 1} de {files.length}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Controles de zoom para imágenes */}
            {isImage && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Alejar"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-sm min-w-[50px] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Acercar"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Rotar"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Acciones */}
            <button
              onClick={() => onFileDownload(currentFile)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Descargar"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => onFileShare(currentFile)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Compartir"
            >
              <Share className="w-5 h-5" />
            </button>
            <button
              onClick={() => onFileEdit(currentFile)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => onFileDelete(currentFile)}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
              title="Eliminar"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navegación lateral */}
      {files.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white z-10"
            title="Anterior (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white z-10"
            title="Siguiente (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Contenido principal */}
      <div className="w-full h-full flex items-center justify-center pt-20 pb-16">
        {loading && (
          <div className="text-white text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Cargando vista previa...</p>
          </div>
        )}

        {error && (
          <div className="text-white text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="mb-2">Error al cargar la vista previa</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Vista previa de imágenes */}
            {isImage && (
              <div className="max-w-full max-h-full flex items-center justify-center">
                <img
                  src={
                    currentFile.url_file ||
                    `/api/files/${currentFile.id_file}/preview`
                  }
                  alt={currentFile.name_file}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  }}
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setError("No se pudo cargar la imagen");
                    setLoading(false);
                  }}
                />
              </div>
            )}

            {/* Vista previa de PDFs */}
            {isPDF && (
              <div className="w-full h-full max-w-4xl mx-auto bg-white rounded-lg overflow-hidden">
                <iframe
                  src={
                    currentFile.url_file ||
                    `/api/files/${currentFile.id_file}/preview`
                  }
                  className="w-full h-full"
                  title={currentFile.name_file}
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setError("No se pudo cargar el PDF");
                    setLoading(false);
                  }}
                />
              </div>
            )}

            {/* Vista previa de videos */}
            {isVideo && (
              <div className="max-w-full max-h-full">
                <video
                  src={
                    currentFile.url_file ||
                    `/api/files/${currentFile.id_file}/preview`
                  }
                  controls
                  className="max-w-full max-h-full"
                  onLoadedData={() => setLoading(false)}
                  onError={() => {
                    setError("No se pudo cargar el video");
                    setLoading(false);
                  }}
                >
                  Tu navegador no soporta la reproducción de video.
                </video>
              </div>
            )}

            {/* Vista previa de audio */}
            {isAudio && (
              <div className="text-white text-center">
                <Music className="w-16 h-16 mx-auto mb-6 text-blue-400" />
                <h3 className="text-xl font-medium mb-4">
                  {currentFile.name_file}
                </h3>
                <audio
                  src={
                    currentFile.url_file ||
                    `/api/files/${currentFile.id_file}/preview`
                  }
                  controls
                  className="mb-4"
                  onLoadedData={() => setLoading(false)}
                  onError={() => {
                    setError("No se pudo cargar el audio");
                    setLoading(false);
                  }}
                >
                  Tu navegador no soporta la reproducción de audio.
                </audio>
              </div>
            )}

            {/* Archivos sin vista previa */}
            {!canPreview && (
              <div className="text-white text-center">
                <FileIcon className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                <h3 className="text-xl font-medium mb-2">
                  {currentFile.name_file}
                </h3>
                <p className="text-gray-400 mb-6">
                  Vista previa no disponible para este tipo de archivo
                </p>
                <button
                  onClick={() => onFileDownload(currentFile)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar para abrir
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer con información del archivo */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 text-white">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-gray-400" />
              <span>{formatFileSize(currentFile.size_file)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(currentFile.created_at_file)}</span>
            </div>
            {currentFile.owner_name && (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>{currentFile.owner_name}</span>
              </div>
            )}
          </div>

          <div className="text-gray-400">
            Usa ← → para navegar • ESC para cerrar
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
