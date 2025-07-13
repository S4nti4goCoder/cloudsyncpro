import {
  Folder,
  Upload,
  Plus,
  Grid3X3,
  List,
  Search,
  Filter,
  ArrowUp,
  Home,
  ChevronRight,
  Loader,
  AlertCircle,
  FolderPlus,
} from "lucide-react";
import { useState, useEffect } from "react";
import FolderItem from "./FolderItem";

const FolderGrid = ({
  folders = [],
  loading = false,
  error = null,
  viewType = "grid",
  onViewTypeChange,
  onFolderClick,
  onFolderCreate,
  onFolderEdit,
  onFolderDelete,
  onFolderDuplicate,
  onFolderMove,
  onFolderShare,
  onFileUpload,
  currentPath = [],
  onNavigate,
  searchTerm = "",
  onSearchChange,
  currentUser,
  formatDate,
  canCreateFolders = true,
}) => {
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState(folders);

  // Filtrar carpetas cuando cambie el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFolders(folders);
    } else {
      const filtered = folders.filter((folder) =>
        folder.name_folder.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFolders(filtered);
    }
  }, [folders, searchTerm]);

  // Selección múltiple
  const handleSelectFolder = (folder) => {
    setSelectedFolders((prev) => {
      const isSelected = prev.find((f) => f.id_folder === folder.id_folder);
      if (isSelected) {
        return prev.filter((f) => f.id_folder !== folder.id_folder);
      } else {
        return [...prev, folder];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedFolders.length === filteredFolders.length) {
      setSelectedFolders([]);
    } else {
      setSelectedFolders([...filteredFolders]);
    }
  };

  const clearSelection = () => {
    setSelectedFolders([]);
  };

  // Breadcrumbs component
  const Breadcrumbs = () => (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <button
        onClick={() => onNavigate?.(null)}
        className="flex items-center hover:text-[#061a4a] transition-colors cursor-pointer"
      >
        <Home className="w-4 h-4 mr-1" />
        Inicio
      </button>

      {currentPath.map((folder, index) => (
        <div key={folder.id} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          <button
            onClick={() => onNavigate?.(folder.id)}
            className={`hover:text-[#061a4a] transition-colors cursor-pointer ${
              index === currentPath.length - 1
                ? "text-gray-900 font-medium"
                : ""
            }`}
          >
            {folder.name}
          </button>
        </div>
      ))}
    </div>
  );

  // Toolbar component
  const Toolbar = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Left section */}
      <div className="flex items-center space-x-3">
        {canCreateFolders && (
          <button
            onClick={onFolderCreate}
            className="flex items-center px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva carpeta
          </button>
        )}

        <button
          onClick={onFileUpload}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4 mr-2" />
          Subir archivos
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar carpetas..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent w-64 cursor-text"
          />
        </div>

        {/* View toggle */}
        <div className="flex border border-gray-300 rounded-lg">
          <button
            onClick={() => onViewTypeChange?.("grid")}
            className={`p-2 cursor-pointer transition-colors ${
              viewType === "grid"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewTypeChange?.("list")}
            className={`p-2 cursor-pointer transition-colors ${
              viewType === "list"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Filter button */}
        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <Filter className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );

  // Selection bar
  const SelectionBar = () => {
    if (selectedFolders.length === 0) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium text-blue-900">
              {selectedFolders.length} carpeta
              {selectedFolders.length !== 1 ? "s" : ""} seleccionada
              {selectedFolders.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                // Aquí iría la lógica para mover carpetas seleccionadas
                console.log("Mover carpetas:", selectedFolders);
              }}
              className="px-3 py-1 text-sm text-blue-700 hover:bg-blue-100 rounded cursor-pointer transition-colors"
            >
              Mover
            </button>
            <button
              onClick={() => {
                // Aquí iría la lógica para eliminar carpetas seleccionadas
                console.log("Eliminar carpetas:", selectedFolders);
              }}
              className="px-3 py-1 text-sm text-red-700 hover:bg-red-100 rounded cursor-pointer transition-colors"
            >
              Eliminar
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs />
        <Toolbar />

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-[#061a4a] mx-auto mb-4" />
            <p className="text-gray-600">Cargando carpetas...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumbs />
        <Toolbar />

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error al cargar carpetas
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredFolders.length === 0) {
    return (
      <div className="space-y-6">
        <Breadcrumbs />
        <Toolbar />

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            {searchTerm ? (
              <>
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron carpetas
                </h3>
                <p className="text-gray-500 mb-4">
                  No hay carpetas que coincidan con "{searchTerm}"
                </p>
                <button
                  onClick={() => onSearchChange?.("")}
                  className="text-[#061a4a] hover:text-[#082563] font-medium cursor-pointer"
                >
                  Limpiar búsqueda
                </button>
              </>
            ) : (
              <>
                <FolderPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay carpetas aún
                </h3>
                <p className="text-gray-500 mb-4">
                  Crea tu primera carpeta para organizar tus archivos
                </p>
                {canCreateFolders && (
                  <button
                    onClick={onFolderCreate}
                    className="inline-flex items-center px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear primera carpeta
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <Toolbar />
      <SelectionBar />

      {/* Folders grid/list */}
      {viewType === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredFolders.map((folder) => (
            <FolderItem
              key={folder.id_folder}
              folder={folder}
              viewType="grid"
              onFolderClick={onFolderClick}
              onEdit={onFolderEdit}
              onDelete={onFolderDelete}
              onDuplicate={onFolderDuplicate}
              onMove={onFolderMove}
              onShare={onFolderShare}
              currentUser={currentUser}
              isSelected={selectedFolders.some(
                (f) => f.id_folder === folder.id_folder
              )}
              onSelect={handleSelectFolder}
              formatDate={formatDate}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          {/* List header */}
          <div className="flex items-center p-4 border-b border-gray-100 bg-gray-50">
            <div className="mr-3">
              <input
                type="checkbox"
                checked={selectedFolders.length === filteredFolders.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-[#061a4a] border-gray-300 rounded focus:ring-[#061a4a] cursor-pointer"
              />
            </div>
            <div className="flex-1 text-sm font-medium text-gray-700">
              Nombre
            </div>
            <div className="w-32 text-sm font-medium text-gray-700 text-center">
              Contenido
            </div>
            <div className="w-32 text-sm font-medium text-gray-700 text-center">
              Creada
            </div>
            <div className="w-16"></div>
          </div>

          {/* List items */}
          {filteredFolders.map((folder) => (
            <FolderItem
              key={folder.id_folder}
              folder={folder}
              viewType="list"
              onFolderClick={onFolderClick}
              onEdit={onFolderEdit}
              onDelete={onFolderDelete}
              onDuplicate={onFolderDuplicate}
              onMove={onFolderMove}
              onShare={onFolderShare}
              currentUser={currentUser}
              isSelected={selectedFolders.some(
                (f) => f.id_folder === folder.id_folder
              )}
              onSelect={handleSelectFolder}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Results info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {filteredFolders.length} carpeta
          {filteredFolders.length !== 1 ? "s" : ""}
          {searchTerm &&
            ` encontrada${
              filteredFolders.length !== 1 ? "s" : ""
            } para "${searchTerm}"`}
        </span>

        {selectedFolders.length > 0 && (
          <span>
            {selectedFolders.length} seleccionada
            {selectedFolders.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
};

export default FolderGrid;
