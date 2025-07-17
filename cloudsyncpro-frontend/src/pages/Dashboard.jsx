import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../services/authService";
import {
  Home,
  Folder,
  Star,
  Share2,
  Clock,
  Trash2,
  HardDrive,
  Settings,
  Search,
  Plus,
  Upload,
  Grid3X3,
  List,
  Filter,
  MoreVertical,
  ChevronRight,
  File,
  Image,
  FileText,
  Download,
  Share,
  MoreHorizontal,
  Menu,
  FolderPlus,
  AlertCircle,
} from "lucide-react";

// Importar componentes de carpetas
import {
  FolderGrid,
  CreateFolderModal,
  EditFolderModal,
  DeleteFolderModal,
  Breadcrumbs,
  folderService,
} from "../components/folders";

// Importar componentes de archivos
import { FileUploadZone, FileGrid } from "../components/files";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [currentView, setCurrentView] = useState("grid"); // grid | list
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  // ===========================
  // ESTADO DE CARPETAS
  // ===========================
  const [folders, setFolders] = useState([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [foldersError, setFoldersError] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ===========================
  // ESTADO DE ARCHIVOS
  // ===========================
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState(null);
  const [fileFilters, setFileFilters] = useState({
    type: "all", // all | images | documents | videos | audio
    search: "",
  });

  // ===========================
  // ESTADO DE MODALES
  // ===========================
  const [createFolderModal, setCreateFolderModal] = useState({
    isOpen: false,
    isLoading: false,
  });

  const [editFolderModal, setEditFolderModal] = useState({
    isOpen: false,
    isLoading: false,
    folder: null,
  });

  const [deleteFolderModal, setDeleteFolderModal] = useState({
    isOpen: false,
    isLoading: false,
    folder: null,
  });

  const [uploadModal, setUploadModal] = useState({
    isOpen: false,
    isLoading: false,
  });

  // ===========================
  // EFECTOS INICIALES
  // ===========================
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);

      if (!hasShownWelcome) {
        setTimeout(() => {
          toast.info("¡Bienvenido a CloudSyncPro!", {
            description: `Hola ${userData.name_user}, gestiona tus archivos de forma inteligente`,
            duration: 4000,
          });
        }, 100);
        setHasShownWelcome(true);
      }

      // Cargar datos iniciales
      loadFolders();
      loadFiles();
    }
  }, [hasShownWelcome]);

  // ===========================
  // FUNCIONES DE CARGA DE DATOS
  // ===========================
  const loadFolders = async (parentId = null, searchQuery = "") => {
    setFoldersLoading(true);
    setFoldersError(null);

    try {
      let result;

      if (searchQuery.trim()) {
        result = await folderService.searchFolders({
          query: searchQuery.trim(),
          parent_id: parentId,
        });
      } else {
        result = await folderService.getFolders({
          parent_id: parentId,
        });
      }

      if (result.success) {
        setFolders(result.data);

        if (parentId !== currentFolderId) {
          await updateCurrentPath(parentId);
        }
      } else {
        setFoldersError(result.message);
        toast.error("Error al cargar carpetas", {
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error cargando carpetas:", error);
      setFoldersError("Error de conexión");
      toast.error("Error al cargar carpetas", {
        description: "No se pudo conectar con el servidor",
      });
    } finally {
      setFoldersLoading(false);
    }
  };

  const loadFiles = async () => {
    setFilesLoading(true);
    setFilesError(null);

    try {
      // Simular datos de archivos (reemplazar con API real)
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockFiles = [
        {
          id_file: 1,
          name_file: "Documento_importante.pdf",
          type_file: "application/pdf",
          size_file: 2048576,
          folder_id: currentFolderId,
          owner_user_id: user?.id_user,
          created_at_file: new Date().toISOString(),
          url_file: "/uploads/documento_importante.pdf",
        },
        {
          id_file: 2,
          name_file: "Presentacion_proyecto.pptx",
          type_file:
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          size_file: 5242880,
          folder_id: currentFolderId,
          owner_user_id: user?.id_user,
          created_at_file: new Date().toISOString(),
          url_file: "/uploads/presentacion_proyecto.pptx",
        },
        {
          id_file: 3,
          name_file: "Imagen_perfil.jpg",
          type_file: "image/jpeg",
          size_file: 1024000,
          folder_id: currentFolderId,
          owner_user_id: user?.id_user,
          created_at_file: new Date().toISOString(),
          url_file: "/uploads/imagen_perfil.jpg",
        },
      ];

      setFiles(mockFiles);
    } catch (error) {
      console.error("Error cargando archivos:", error);
      setFilesError("Error al cargar archivos");
      toast.error("Error al cargar archivos", {
        description: "No se pudo conectar con el servidor",
      });
    } finally {
      setFilesLoading(false);
    }
  };

  const updateCurrentPath = async (folderId) => {
    if (!folderId) {
      setCurrentPath([]);
      setCurrentFolderId(null);
      return;
    }

    try {
      const result = await folderService.getFolderPath(folderId);
      if (result.success) {
        const breadcrumbs = folderService.buildBreadcrumbs(result.data);
        setCurrentPath(breadcrumbs.slice(1));
        setCurrentFolderId(folderId);
      }
    } catch (error) {
      console.error("Error obteniendo ruta:", error);
    }
  };

  // ===========================
  // MANEJADORES DE CARPETAS
  // ===========================
  const handleFolderClick = (folder) => {
    setCurrentFolderId(folder.id_folder);
    loadFolders(folder.id_folder, searchTerm);
    loadFiles(); // Recargar archivos para la nueva carpeta
  };

  const handleNavigate = (folderId) => {
    setCurrentFolderId(folderId);
    loadFolders(folderId, searchTerm);
    loadFiles(); // Recargar archivos para la nueva carpeta
  };

  const handleCreateFolder = () => {
    setCreateFolderModal({ isOpen: true, isLoading: false });
  };

  const handleCreateFolderSave = async (folderData) => {
    setCreateFolderModal((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await folderService.createFolder({
        name_folder: folderData.name_folder,
        parent_folder_id: folderData.parent_folder_id,
      });

      if (result.success) {
        toast.success("Carpeta creada exitosamente", {
          description: `La carpeta "${folderData.name_folder}" ha sido creada`,
        });

        await loadFolders(currentFolderId, searchTerm);
        setCreateFolderModal({ isOpen: false, isLoading: false });
      } else {
        toast.error("Error al crear carpeta", {
          description: result.message,
        });
        setCreateFolderModal((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error creando carpeta:", error);
      toast.error("Error al crear carpeta", {
        description: "No se pudo conectar con el servidor",
      });
      setCreateFolderModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleEditFolder = async (folder) => {
    setEditFolderModal({
      isOpen: true,
      isLoading: false,
      folder,
    });
  };

  const handleEditFolderSave = async (folderId, updateData) => {
    setEditFolderModal((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await folderService.updateFolder(folderId, updateData);

      if (result.success) {
        toast.success("Carpeta actualizada", {
          description: `La carpeta ha sido renombrada exitosamente`,
        });

        await loadFolders(currentFolderId, searchTerm);
        setEditFolderModal({ isOpen: false, isLoading: false, folder: null });
      } else {
        toast.error("Error al actualizar carpeta", {
          description: result.message,
        });
        setEditFolderModal((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error actualizando carpeta:", error);
      toast.error("Error al actualizar carpeta", {
        description: "No se pudo conectar con el servidor",
      });
      setEditFolderModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteFolder = async (folder) => {
    setDeleteFolderModal({
      isOpen: true,
      isLoading: false,
      folder,
    });
  };

  const handleDeleteFolderConfirm = async () => {
    if (!deleteFolderModal.folder) return;

    setDeleteFolderModal((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await folderService.deleteFolder(
        deleteFolderModal.folder.id_folder
      );

      if (result.success) {
        toast.success("Carpeta eliminada", {
          description: `La carpeta "${deleteFolderModal.folder.name_folder}" ha sido eliminada`,
        });

        await loadFolders(currentFolderId, searchTerm);
        setDeleteFolderModal({ isOpen: false, isLoading: false, folder: null });
      } else {
        toast.error("Error al eliminar carpeta", {
          description: result.message,
        });
        setDeleteFolderModal((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error eliminando carpeta:", error);
      toast.error("Error al eliminar carpeta", {
        description: "No se pudo conectar con el servidor",
      });
      setDeleteFolderModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleDuplicateFolder = async (folder) => {
    try {
      const result = await folderService.duplicateFolder(folder.id_folder);

      if (result.success) {
        toast.success("Carpeta duplicada", {
          description: `Se creó una copia de "${folder.name_folder}"`,
        });
        await loadFolders(currentFolderId, searchTerm);
      } else {
        toast.error("Error al duplicar", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Error al duplicar carpeta");
    }
  };

  const handleMoveFolder = async (folder) => {
    toast.info("Mover carpeta", {
      description: `Funcionalidad de movimiento para "${folder.name_folder}" - Próximamente`,
    });
  };

  const handleShareFolder = async (folder) => {
    toast.info("Compartir carpeta", {
      description: `Funcionalidad de compartir para "${folder.name_folder}" - Próximamente`,
    });
  };

  // ===========================
  // MANEJADORES DE ARCHIVOS
  // ===========================
  const handleFileUpload = () => {
    setUploadModal({ isOpen: true, isLoading: false });
  };

  const handleFileUploadSave = async (uploadedFiles) => {
    setUploadModal((prev) => ({ ...prev, isLoading: true }));

    try {
      // Simular subida de archivos
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Archivos subidos exitosamente", {
        description: `Se subieron ${uploadedFiles.length} archivo(s)`,
      });

      await loadFiles(); // Recargar archivos
      setUploadModal({ isOpen: false, isLoading: false });
    } catch (error) {
      console.error("Error subiendo archivos:", error);
      toast.error("Error al subir archivos", {
        description: "No se pudo conectar con el servidor",
      });
      setUploadModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleFileEdit = (file) => {
    toast.info("Editar archivo", {
      description: `Funcionalidad de edición para "${file.name_file}" - Próximamente`,
    });
  };

  const handleFileDelete = (file) => {
    toast.info("Eliminar archivo", {
      description: `Funcionalidad de eliminación para "${file.name_file}" - Próximamente`,
    });
  };

  const handleFileDownload = (file) => {
    toast.info("Descargar archivo", {
      description: `Descargando "${file.name_file}"...`,
    });
  };

  const handleFileShare = (file) => {
    toast.info("Compartir archivo", {
      description: `Funcionalidad de compartir para "${file.name_file}" - Próximamente`,
    });
  };

  const handleFilePreview = (file) => {
    toast.info("Vista previa", {
      description: `Abriendo vista previa de "${file.name_file}" - Próximamente`,
    });
  };

  const handleSearchChange = (query) => {
    setSearchTerm(query);
    setFileFilters((prev) => ({ ...prev, search: query }));
    loadFolders(currentFolderId, query);
  };

  const handleFileFilterChange = (filterType, value) => {
    setFileFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleLogout = async () => {
    const loadingToast = toast.loading("Cerrando sesión...");

    try {
      await authService.logout();
      toast.dismiss(loadingToast);
      toast.success("Sesión cerrada correctamente", {
        duration: 3000,
      });
      navigate("/login");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.success("Sesión cerrada correctamente", {
        duration: 3000,
      });
      navigate("/login");
    }
  };

  // ===========================
  // FUNCIÓN DE FORMATEO
  // ===========================
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ===========================
  // DATOS DE SIDEBAR
  // ===========================
  const sidebarItems = [
    { icon: Home, label: "Inicio", count: null, active: true },
    {
      icon: Folder,
      label: "Mis archivos",
      count: folders.length,
      active: false,
    },
    { icon: Star, label: "Destacados", count: 3, active: false },
    { icon: Share2, label: "Compartidos", count: 5, active: false },
    { icon: Clock, label: "Recientes", count: null, active: false },
    { icon: Trash2, label: "Papelera", count: 2, active: false },
  ];

  // ===========================
  // RENDER CONDICIONAL
  // ===========================
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#061a4a] mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#061a4a] rounded-lg flex items-center justify-center">
              <Folder className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="ml-3 font-semibold text-gray-900">
                CloudSyncPro
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 cursor-pointer ${
                  item.active
                    ? "bg-[#061a4a]/10 text-[#061a4a] border border-[#061a4a]/20"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left">{item.label}</span>
                    {item.count !== null && (
                      <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Storage Info */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <HardDrive className="w-4 h-4 mr-2" />
              <span>Almacenamiento</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-[#061a4a] h-2 rounded-full"
                style={{ width: "65%" }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">6.5 GB de 10 GB utilizados</p>
          </div>
        )}

        {/* Settings */}
        <div className="p-2 border-t border-gray-100">
          <button className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors">
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3">Configuración</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title={sidebarCollapsed ? "Mostrar sidebar" : "Ocultar sidebar"}
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en CloudSyncPro"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent cursor-text"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Bienvenido,{" "}
                <span className="font-medium">{user.name_user}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-100 px-6 py-3">
          <Breadcrumbs
            currentPath={currentPath}
            onNavigate={handleNavigate}
            currentFolder={folders.find((f) => f.id_folder === currentFolderId)}
            showActions={true}
            maxVisibleItems={4}
          />
        </div>

        {/* Content Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              {currentPath.length > 0
                ? currentPath[currentPath.length - 1].name
                : "Inicio"}
            </h1>

            {/* Toolbar */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCreateFolder}
                className="flex items-center px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo
              </button>
              <button
                onClick={handleFileUpload}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir
              </button>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setCurrentView("grid")}
                  className={`p-2 cursor-pointer transition-colors ${
                    currentView === "grid"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentView("list")}
                  className={`p-2 cursor-pointer transition-colors ${
                    currentView === "list"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area - DISEÑO MIXTO RESTAURADO */}
        <main className="flex-1 p-6">
          <div className="space-y-8">
            {/* Sección de Carpetas */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Folder className="w-5 h-5 text-blue-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Carpetas ({folders.length})
                  </h2>
                </div>
              </div>

              <FolderGrid
                folders={folders}
                loading={foldersLoading}
                error={foldersError}
                viewType={currentView}
                onViewTypeChange={setCurrentView}
                onFolderClick={handleFolderClick}
                onFolderCreate={handleCreateFolder}
                onFolderEdit={handleEditFolder}
                onFolderDelete={handleDeleteFolder}
                onFolderDuplicate={handleDuplicateFolder}
                onFolderMove={handleMoveFolder}
                onFolderShare={handleShareFolder}
                onFileUpload={handleFileUpload}
                currentPath={currentPath}
                onNavigate={handleNavigate}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                currentUser={user}
                formatDate={formatDate}
                canCreateFolders={true}
              />
            </div>

            {/* Sección de Archivos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <File className="w-5 h-5 text-green-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Archivos ({files.length})
                  </h2>
                </div>
              </div>

              <FileGrid
                files={files}
                loading={filesLoading}
                error={filesError}
                viewType={currentView}
                onViewTypeChange={setCurrentView}
                onFileEdit={handleFileEdit}
                onFileDelete={handleFileDelete}
                onFileDownload={handleFileDownload}
                onFileShare={handleFileShare}
                onFilePreview={handleFilePreview}
                onFileUpload={handleFileUpload}
                filters={fileFilters}
                onFilterChange={handleFileFilterChange}
                currentUser={user}
                formatDate={formatDate}
                canUploadFiles={true}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Modales */}
      <CreateFolderModal
        isOpen={createFolderModal.isOpen}
        onClose={() =>
          setCreateFolderModal({ isOpen: false, isLoading: false })
        }
        onSave={handleCreateFolderSave}
        isLoading={createFolderModal.isLoading}
        currentPath={currentPath}
        parentFolderId={currentFolderId}
        existingFolders={folders}
      />

      <EditFolderModal
        isOpen={editFolderModal.isOpen}
        onClose={() =>
          setEditFolderModal({ isOpen: false, isLoading: false, folder: null })
        }
        onSave={handleEditFolderSave}
        folder={editFolderModal.folder}
        isLoading={editFolderModal.isLoading}
        currentPath={currentPath}
        existingFolders={folders}
      />

      <DeleteFolderModal
        isOpen={deleteFolderModal.isOpen}
        onClose={() =>
          setDeleteFolderModal({
            isOpen: false,
            isLoading: false,
            folder: null,
          })
        }
        onConfirm={handleDeleteFolderConfirm}
        folder={deleteFolderModal.folder}
        isLoading={deleteFolderModal.isLoading}
        currentPath={currentPath}
      />

      {/* Modal de Subida de Archivos */}
      <FileUploadZone
        isOpen={uploadModal.isOpen}
        onClose={() => setUploadModal({ isOpen: false, isLoading: false })}
        onSave={handleFileUploadSave}
        isLoading={uploadModal.isLoading}
        currentPath={currentPath}
        folderId={currentFolderId}
      />
    </div>
  );
};

export default Dashboard;
