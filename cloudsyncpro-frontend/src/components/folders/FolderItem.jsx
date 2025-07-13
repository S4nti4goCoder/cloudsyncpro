import {
  Folder,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Move,
  Share,
  Star,
  Download,
  FolderOpen,
  Calendar,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const FolderItem = ({
  folder,
  viewType = "grid", // "grid" | "list"
  onFolderClick,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
  onShare,
  currentUser,
  isSelected = false,
  onSelect,
  formatDate,
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

  const handleFolderDoubleClick = () => {
    onFolderClick?.(folder);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (action, e) => {
    e.stopPropagation();
    setShowMenu(false);

    switch (action) {
      case "edit":
        onEdit?.(folder);
        break;
      case "delete":
        onDelete?.(folder);
        break;
      case "duplicate":
        onDuplicate?.(folder);
        break;
      case "move":
        onMove?.(folder);
        break;
      case "share":
        onShare?.(folder);
        break;
      default:
        break;
    }
  };

  const isOwner = currentUser && folder.owner_user_id === currentUser.id_user;
  const isAdmin = currentUser && currentUser.role_user === "admin";
  const canEdit = isOwner || isAdmin;

  // Menú de opciones
  const MenuDropdown = () => (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]"
    >
      <button
        onClick={(e) => handleMenuAction("edit", e)}
        disabled={!canEdit}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <Edit className="w-4 h-4 mr-3" />
        Renombrar
      </button>

      <button
        onClick={(e) => handleMenuAction("duplicate", e)}
        disabled={!canEdit}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <Copy className="w-4 h-4 mr-3" />
        Duplicar
      </button>

      <button
        onClick={(e) => handleMenuAction("move", e)}
        disabled={!canEdit}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <Move className="w-4 h-4 mr-3" />
        Mover
      </button>

      <div className="border-t border-gray-100 my-1"></div>

      <button
        onClick={(e) => handleMenuAction("share", e)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
      >
        <Share className="w-4 h-4 mr-3" />
        Compartir
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
        onDoubleClick={handleFolderDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect?.(folder)}
      >
        {/* Folder Icon */}
        <div className="flex flex-col items-center">
          <div className="mb-3 relative">
            {isHovered ? (
              <FolderOpen className="w-12 h-12 text-[#061a4a] transition-all duration-200" />
            ) : (
              <Folder className="w-12 h-12 text-blue-500 transition-all duration-200" />
            )}

            {/* Owner indicator */}
            {!isOwner && folder.owner_name && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-2 h-2 text-purple-600" />
              </div>
            )}
          </div>

          {/* Folder Name */}
          <h3 className="text-sm font-medium text-gray-900 text-center mb-1 line-clamp-2 max-w-full">
            {folder.name_folder}
          </h3>

          {/* Folder Info */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <div className="flex items-center justify-center space-x-2">
              <span>{folder.subfolders_count || 0} carpetas</span>
              <span>•</span>
              <span>{folder.files_count || 0} archivos</span>
            </div>

            {formatDate && (
              <div className="flex items-center justify-center text-xs text-gray-400">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(folder.created_at_folder)}
              </div>
            )}
          </div>

          {/* Owner info for non-owners */}
          {!isOwner && folder.owner_name && (
            <div className="mt-2 text-xs text-purple-600 text-center">
              Por: {folder.owner_name}
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
      onDoubleClick={handleFolderDoubleClick}
      onClick={() => onSelect?.(folder)}
    >
      <div className="flex items-center flex-1 min-w-0">
        {/* Selection checkbox */}
        <div className="mr-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect?.(folder)}
            className="w-4 h-4 text-[#061a4a] border-gray-300 rounded focus:ring-[#061a4a] cursor-pointer"
          />
        </div>

        {/* Folder icon */}
        <div className="mr-4 flex-shrink-0">
          <Folder className="w-8 h-8 text-blue-500" />
        </div>

        {/* Folder info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {folder.name_folder}
            </h3>

            {!isOwner && folder.owner_name && (
              <div className="ml-2 flex items-center">
                <User className="w-3 h-3 text-purple-600 mr-1" />
                <span className="text-xs text-purple-600">
                  {folder.owner_name}
                </span>
              </div>
            )}
          </div>

          <div className="mt-1 flex items-center text-xs text-gray-500 space-x-4">
            <span>{folder.subfolders_count || 0} carpetas</span>
            <span>{folder.files_count || 0} archivos</span>
            {formatDate && <span>{formatDate(folder.created_at_folder)}</span>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {/* Favorite button */}
        <button className="p-2 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
          <Star className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
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

export default FolderItem;
