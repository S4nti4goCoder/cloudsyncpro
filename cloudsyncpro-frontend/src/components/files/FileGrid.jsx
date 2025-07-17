import {
  File,
  Upload,
  Grid3X3,
  List,
  Search,
  Filter,
  ArrowUp,
  AlertCircle,
  Image,
  FileText,
  Play,
  Music,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader,
} from "lucide-react";
import { useState, useEffect } from "react";
import FileItem from "./FileItem";

const FileGrid = ({
  files = [],
  loading = false,
  error = null,
  viewType = "grid",
  onViewTypeChange,
  onFileEdit,
  onFileDelete,
  onFileDownload,
  onFileShare,
  onFilePreview,
  onFileUpload,
  filters = { type: "all", search: "" },
  onFilterChange,
  currentUser,
  formatDate,
  canUploadFiles = true,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState(files);

  // Filtrar archivos cuando cambien los filtros o los archivos
  useEffect(() => {
    let filtered = [...files];

    // Filtrar por tipo
    if (filters.type !== "all") {
      filtered = filtered.filter((file) => {
        const fileType = getFileCategory(file.type_file);
        return fileType === filters.type;
      });
    }

    // Filtrar por búsqueda
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter((file) =>
        file.name_file.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredFiles(filtered);
  }, [files, filters]);

  // Función para categorizar archivos
  const getFileCategory = (mimeType) => {
    if (mimeType.startsWith("image/")) return "images";
    if (mimeType.startsWith("video/")) return "videos";
    if (mimeType.startsWith("audio/")) return "audio";
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("document") ||
      mimeType.includes("text") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("presentation")
    ) {
      return "documents";
    }
    return "documents"; // Por defecto
  };

  // Contar archivos por categoría
  const getFileCount = (category) => {
    if (category === "all") return files.length;
    return files.filter((file) => getFileCategory(file.type_file) === category)
      .length;
  };

  // Selección múltiple
  const handleSelectFile = (file) => {
    setSelectedFiles((prev) => {
      const isSelected = prev.find((f) => f.id_file === file.id_file);
      if (isSelected) {
        return prev.filter((f) => f.id_file !== file.id_file);
      } else {
        return [...prev, file];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...filteredFiles]);
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
  };

  // Filtros de tipo - ESTILOS ORIGINALES RESTAURADOS
  const typeFilters = [
    {
      key: "all",
      label: "Todos",
      icon: File,
      count: getFileCount("all"),
    },
    {
      key: "images",
      label: "Imágenes",
      icon: Image,
      count: getFileCount("images"),
    },
    {
      key: "documents",
      label: "Documentos",
      icon: FileText,
      count: getFileCount("documents"),
    },
    {
      key: "videos",
      label: "Videos",
      icon: Play,
      count: getFileCount("videos"),
    },
    {
      key: "audio",
      label: "Audio",
      icon: Music,
      count: getFileCount("audio"),
    },
  ];

  // Selección bar
  const SelectionBar = () => {
    if (selectedFiles.length === 0) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium text-blue-900">
              {selectedFiles.length} archivo
              {selectedFiles.length !== 1 ? "s" : ""} seleccionado
              {selectedFiles.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                selectedFiles.forEach((file) => onFileDownload(file));
                clearSelection();
              }}
              className="px-3 py-1 text-sm text-blue-700 hover:bg-blue-100 rounded cursor-pointer transition-colors"
            >
              Descargar
            </button>
            <button
              onClick={() => {
                selectedFiles.forEach((file) => onFileDelete(file));
                clearSelection();
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
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-[#061a4a] mx-auto mb-4" />
            <p className="text-gray-600">Cargando archivos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error al cargar archivos
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
  if (filteredFiles.length === 0) {
    const isFiltered = filters.search || filters.type !== "all";

    return (
      <div className="space-y-6">
        {/* Filtros simples - ESTILO ORIGINAL */}
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-sm text-gray-500">Filtrar por:</span>
          {typeFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.key}
                onClick={() => onFilterChange("type", filter.key)}
                className={`text-sm px-3 py-1 rounded cursor-pointer transition-colors ${
                  filters.type === filter.key
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            );
          })}

          {/* Filtro actual */}
          <span className="text-sm text-gray-400">
            | Archivos mostrados: {filteredFiles.length}
          </span>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            {isFiltered ? (
              <>
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron archivos
                </h3>
                <p className="text-gray-500 mb-4">
                  No hay archivos que coincidan con los filtros aplicados
                </p>
                <button
                  onClick={() => {
                    onFilterChange("search", "");
                    onFilterChange("type", "all");
                  }}
                  className="text-[#061a4a] hover:text-[#082563] font-medium cursor-pointer"
                >
                  Limpiar filtros
                </button>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay archivos aún
                </h3>
                <p className="text-gray-500 mb-6">
                  Sube tu primer archivo para comenzar
                </p>
                {canUploadFiles && (
                  <button
                    onClick={onFileUpload}
                    className="inline-flex items-center px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir primer archivo
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main content con archivos
  return (
    <div className="space-y-6">
      {/* Filtros simples - ESTILO ORIGINAL RESTAURADO */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Filtrar por:</span>
          {typeFilters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.key}
                onClick={() => onFilterChange("type", filter.key)}
                className={`text-sm px-3 py-1 rounded cursor-pointer transition-colors ${
                  filters.type === filter.key
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            );
          })}

          {/* Filtro actual */}
          <span className="text-sm text-gray-400">
            | Archivos mostrados: {filteredFiles.length}
          </span>
        </div>

        {/* Búsqueda y botón subir */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar archivos..."
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent w-64 cursor-text"
            />
          </div>

          {canUploadFiles && (
            <button
              onClick={onFileUpload}
              className="flex items-center px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir
            </button>
          )}
        </div>
      </div>

      <SelectionBar />

      {/* Files grid/list */}
      {viewType === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <FileItem
              key={file.id_file}
              file={file}
              viewType="grid"
              onFileEdit={onFileEdit}
              onFileDelete={onFileDelete}
              onFileDownload={onFileDownload}
              onFileShare={onFileShare}
              onFilePreview={onFilePreview}
              currentUser={currentUser}
              isSelected={selectedFiles.some((f) => f.id_file === file.id_file)}
              onSelect={handleSelectFile}
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
                checked={selectedFiles.length === filteredFiles.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-[#061a4a] border-gray-300 rounded focus:ring-[#061a4a] cursor-pointer"
              />
            </div>
            <div className="flex-1 text-sm font-medium text-gray-700">
              Nombre
            </div>
            <div className="w-24 text-sm font-medium text-gray-700 text-center">
              Tamaño
            </div>
            <div className="w-32 text-sm font-medium text-gray-700 text-center">
              Modificado
            </div>
            <div className="w-16"></div>
          </div>

          {/* List items */}
          {filteredFiles.map((file) => (
            <FileItem
              key={file.id_file}
              file={file}
              viewType="list"
              onFileEdit={onFileEdit}
              onFileDelete={onFileDelete}
              onFileDownload={onFileDownload}
              onFileShare={onFileShare}
              onFilePreview={onFilePreview}
              currentUser={currentUser}
              isSelected={selectedFiles.some((f) => f.id_file === file.id_file)}
              onSelect={handleSelectFile}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Results info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {filteredFiles.length} archivo
          {filteredFiles.length !== 1 ? "s" : ""}
          {filters.search &&
            ` encontrado${filteredFiles.length !== 1 ? "s" : ""} para "${
              filters.search
            }"`}
        </span>

        {selectedFiles.length > 0 && (
          <span>
            {selectedFiles.length} seleccionado
            {selectedFiles.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
};

export default FileGrid;
