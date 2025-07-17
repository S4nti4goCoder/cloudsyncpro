import {
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Share,
  MoreHorizontal,
  Trash2,
  Eye,
  Calendar,
  HardDrive,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const FileItem = ({
  file,
  viewType = "grid", // "grid" | "list"
  onFileClick,
  onFileDownload,
  onFileDelete,
  onFileShare,
  onFilePreview,
  currentUser,
  isSelected = false,
  onSelect,
  formatDate,
  formatFileSize,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Obtener icono según tipo de archivo
  const getFileIcon = (mimeType, fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    // Imágenes
    if (
      mimeType?.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(extension)
    ) {
      return { icon: Image, color: "text-green-500", bg: "bg-green-100" };
    }

    // Videos
    if (
      mimeType?.startsWith("video/") ||
      ["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(extension)
    ) {
      return { icon: Video, color: "text-purple-500", bg: "bg-purple-100" };
    }

    // Audio
    if (
      mimeType?.startsWith("audio/") ||
      ["mp3", "wav", "flac", "aac", "ogg"].includes(extension)
    ) {
      return { icon: Music, color: "text-pink-500", bg: "bg-pink-100" };
    }

    // Documentos PDF
    if (mimeType === "application/pdf" || extension === "pdf") {
      return { icon: FileText, color: "text-red-500", bg: "bg-red-100" };
    }

    // Documentos Office
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension)) {
      return { icon: FileText, color: "text-blue-500", bg: "bg-blue-100" };
    }

    // Archivos comprimidos
    if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
      return { icon: Archive, color: "text-orange-500", bg: "bg-orange-100" };
    }

    // Por defecto
    return { icon: File, color: "text-gray-500", bg: "bg-gray-100" };
  };

  const fileIcon = getFileIcon(file.type_file, file.name_file);
  const Icon = fileIcon.icon;

  const handleFileDoubleClick = () => {
    onFileClick?.(file);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (action, e) => {
    e.stopPropagation();
    setShowMenu(false);

    switch (action) {
      case "preview":
        onFilePreview?.(file);
        break;
      case "download":
        onFileDownload?.(file);
        break;
      case "share":
        onFileShare?.(file);
        break;
      case "delete":
        onFileDelete?.(file);
        break;
      default:
        break;
    }
  };

  const isOwner = currentUser && file.owner_user_id === currentUser.id_user;
  const isAdmin = currentUser && currentUser.role_user === "admin";
  const canEdit = isOwner || isAdmin;

  // Menú de opciones
  const MenuDropdown = () => (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]"
    >
      <button
        onClick={(e) => handleMenuAction("preview", e)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
      >
        <Eye className="w-4 h-4 mr-3" />
        Ver archivo
      </button>

      <button
        onClick={(e) => handleMenuAction("download", e)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
      >
        <Download className="w-4 h-4 mr-3" />
        Descargar
      </button>

      <div className="border-t border-gray-100 my-1"></div>

      <button
        onClick={(e) => handleMenuAction("share", e)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
      >
        <Share className="w-4 h-4 mr-3" />
        Compartir
      </button>

      <div className="border-t border-gray-100 my-1"></div>

      <button
        onClick={(e) => handleMenuAction("delete", e)}
        disabled={!canEdit}
        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <Trash2 className="w-4 h-4 mr-3" />
        Eliminar
      </button>
    </div>
  );

  // Vista Grid
  if (viewType === "grid") {
    return (
      <div
        className={`
          relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer group
          ${isSelected ? "ring-2 ring-[#061a4a] border-[#061a4a]" : ""}
          ${isHovered ? "shadow-md" : ""}
        `}
        onDoubleClick={handleFileDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect?.(file)}
      >
        {/* File Icon */}
        <div className="flex flex-col items-center">
          <div className="mb-3 relative">
            <div className={`p-3 rounded-lg ${fileIcon.bg}`}>
              <Icon className={`w-8 h-8 ${fileIcon.color}`} />
            </div>

            {/* Owner indicator */}
            {!isOwner && file.owner_name && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full" />
              </div>
            )}
          </div>

          {/* File Name */}
          <h3 className="text-sm font-medium text-gray-900 text-center mb-1 line-clamp-2 max-w-full">
            {file.name_file}
          </h3>

          {/* File Info */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <div className="flex items-center justify-center">
              <span>
                {formatFileSize ? formatFileSize(file.size_file) : "1 MB"}
              </span>
            </div>

            {formatDate && (
              <div className="flex items-center justify-center text-xs text-gray-400">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(file.created_at_file)}
              </div>
            )}
          </div>

          {/* Owner info for non-owners */}
          {!isOwner && file.owner_name && (
            <div className="mt-2 text-xs text-purple-600 text-center">
              Por: {file.owner_name}
            </div>
          )}
        </div>

        {/* Menu Button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleMenuClick}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>

          {showMenu && <MenuDropdown />}
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2">
            <div className="w-4 h-4 bg-[#061a4a] rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista List
  return (
    <div
      className={`
        relative flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer group transition-colors
        ${isSelected ? "bg-blue-50 border-blue-200" : ""}
      `}
      onDoubleClick={handleFileDoubleClick}
      onClick={() => onSelect?.(file)}
    >
      <div className="flex items-center flex-1 min-w-0">
        {/* Selection checkbox */}
        <div className="mr-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect?.(file)}
            className="w-4 h-4 text-[#061a4a] border-gray-300 rounded focus:ring-[#061a4a] cursor-pointer"
          />
        </div>

        {/* File icon */}
        <div className="mr-4 flex-shrink-0">
          <div className={`p-2 rounded-lg ${fileIcon.bg}`}>
            <Icon className={`w-6 h-6 ${fileIcon.color}`} />
          </div>
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {file.name_file}
            </h3>

            {!isOwner && file.owner_name && (
              <div className="ml-2 flex items-center">
                <div className="w-3 h-3 text-purple-600 mr-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full" />
                </div>
                <span className="text-xs text-purple-600">
                  {file.owner_name}
                </span>
              </div>
            )}
          </div>

          <div className="mt-1 flex items-center text-xs text-gray-500 space-x-4">
            <span className="flex items-center">
              <HardDrive className="w-3 h-3 mr-1" />
              {formatFileSize ? formatFileSize(file.size_file) : "1 MB"}
            </span>
            {formatDate && (
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(file.created_at_file)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {/* Quick download button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFileDownload?.(file);
          }}
          className="p-2 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          title="Descargar"
        >
          <Download className="w-4 h-4 text-gray-400 hover:text-blue-500" />
        </button>

        {/* Menu button */}
        <div className="relative">
          <button
            onClick={handleMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>

          {showMenu && <MenuDropdown />}
        </div>
      </div>
    </div>
  );
};

export default FileItem;
