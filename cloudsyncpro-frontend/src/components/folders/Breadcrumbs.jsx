import {
  Home,
  ChevronRight,
  Folder,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Share,
  Info,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const Breadcrumbs = ({
  currentPath = [],
  onNavigate,
  currentFolder = null,
  showActions = true,
  maxVisibleItems = 4,
  className = "",
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuTarget, setMenuTarget] = useState(null);
  const menuRef = useRef(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
        setMenuTarget(null);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Construir la ruta completa incluyendo el inicio
  const buildFullPath = () => {
    const fullPath = [
      {
        id: null,
        name: "Inicio",
        isRoot: true,
        level: -1,
      },
    ];

    if (currentPath && currentPath.length > 0) {
      // Ordenar por nivel para asegurar la jerarquía correcta
      const sortedPath = [...currentPath].sort(
        (a, b) => (b.level || 0) - (a.level || 0)
      );
      fullPath.push(
        ...sortedPath.map((folder) => ({
          id: folder.id || folder.id_folder,
          name: folder.name || folder.name_folder,
          isRoot: false,
          level: folder.level || 0,
        }))
      );
    }

    return fullPath;
  };

  const fullPath = buildFullPath();

  // Determinar qué elementos mostrar (con collapse si es necesario)
  const getDisplayPath = () => {
    if (fullPath.length <= maxVisibleItems) {
      return { visibleItems: fullPath, hasCollapse: false, collapsedItems: [] };
    }

    // Si hay demasiados elementos, colapsar los del medio
    const start = fullPath.slice(0, 1); // Siempre mostrar "Inicio"
    const end = fullPath.slice(-2); // Siempre mostrar los últimos 2
    const middle = fullPath.slice(1, -2); // Los elementos del medio para colapsar

    const visibleItems = [...start, { isCollapse: true }, ...end];
    return { visibleItems, hasCollapse: true, collapsedItems: middle };
  };

  const { visibleItems, hasCollapse, collapsedItems } = getDisplayPath();

  // Manejadores de eventos
  const handleNavigate = (folderId) => {
    onNavigate?.(folderId);
  };

  const handleMenuClick = (event, item) => {
    event.stopPropagation();
    setMenuTarget(item);
    setShowMenu(true);
  };

  const handleMenuAction = (action, item) => {
    setShowMenu(false);
    setMenuTarget(null);

    switch (action) {
      case "navigate":
        handleNavigate(item.id);
        break;
      case "copy":
        // Copiar ruta al portapapeles
        const pathString = fullPath.map((p) => p.name).join(" > ");
        navigator.clipboard?.writeText(pathString);
        break;
      case "share":
        // TODO: Implementar compartir
        console.log("Compartir ruta:", item);
        break;
      case "info":
        // TODO: Mostrar información
        console.log("Información de:", item);
        break;
      default:
        break;
    }
  };

  // Componente de menú desplegable
  const DropdownMenu = ({ item }) => (
    <div
      ref={menuRef}
      className="absolute top-8 left-0 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px]"
    >
      <button
        onClick={() => handleMenuAction("navigate", item)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
      >
        <ExternalLink className="w-4 h-4 mr-3" />
        Ir a esta carpeta
      </button>

      <button
        onClick={() => handleMenuAction("copy", item)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
      >
        <Copy className="w-4 h-4 mr-3" />
        Copiar ruta
      </button>

      <div className="border-t border-gray-100 my-1"></div>

      <button
        onClick={() => handleMenuAction("share", item)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
      >
        <Share className="w-4 h-4 mr-3" />
        Compartir
      </button>

      <button
        onClick={() => handleMenuAction("info", item)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
      >
        <Info className="w-4 h-4 mr-3" />
        Información
      </button>
    </div>
  );

  // Componente de menú colapsado
  const CollapseMenu = () => (
    <div
      ref={menuRef}
      className="absolute top-8 left-0 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] max-h-64 overflow-y-auto"
    >
      <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
        Carpetas intermedias
      </div>
      {collapsedItems.map((item, index) => (
        <button
          key={item.id || index}
          onClick={() => handleMenuAction("navigate", item)}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <Folder className="w-4 h-4 mr-3 text-blue-500" />
          <span className="truncate">{item.name}</span>
        </button>
      ))}
    </div>
  );

  return (
    <nav
      className={`flex items-center space-x-1 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      {visibleItems.map((item, index) => {
        // Elemento colapsado
        if (item.isCollapse) {
          return (
            <div key="collapse" className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuTarget("collapse");
                    setShowMenu(true);
                  }}
                  className="flex items-center px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                  title="Mostrar carpetas intermedias"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showMenu && menuTarget === "collapse" && <CollapseMenu />}
              </div>
            </div>
          );
        }

        const isLast = index === visibleItems.length - 1;
        const isRoot = item.isRoot;

        return (
          <div key={item.id || "root"} className="flex items-center">
            {/* Separador (excepto para el primer elemento) */}
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            )}

            {/* Elemento del breadcrumb */}
            <div className="relative group">
              <button
                onClick={() => !isLast && handleNavigate(item.id)}
                className={`flex items-center px-2 py-1 rounded transition-all duration-200 ${
                  isLast
                    ? "text-gray-900 font-medium cursor-default"
                    : "text-gray-600 hover:text-[#061a4a] hover:bg-blue-50 cursor-pointer"
                }`}
                disabled={isLast}
              >
                {/* Icono */}
                {isRoot ? (
                  <Home className="w-4 h-4 mr-1" />
                ) : (
                  <Folder className="w-4 h-4 mr-1 text-blue-500" />
                )}

                {/* Nombre */}
                <span className="max-w-[150px] truncate">{item.name}</span>
              </button>

              {/* Menú de acciones (visible en hover) */}
              {showActions && !isLast && (
                <button
                  onClick={(e) => handleMenuClick(e, item)}
                  className="absolute -right-1 top-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all cursor-pointer"
                  title="Más opciones"
                >
                  <MoreHorizontal className="w-3 h-3 text-gray-500" />
                </button>
              )}

              {/* Menú desplegable */}
              {showMenu && menuTarget && menuTarget.id === item.id && (
                <DropdownMenu item={item} />
              )}
            </div>
          </div>
        );
      })}

      {/* Información adicional del folder actual */}
      {currentFolder && (
        <div className="ml-4 pl-4 border-l border-gray-200">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{currentFolder.subfolders_count || 0} carpetas</span>
            <span>•</span>
            <span>{currentFolder.files_count || 0} archivos</span>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Breadcrumbs;
