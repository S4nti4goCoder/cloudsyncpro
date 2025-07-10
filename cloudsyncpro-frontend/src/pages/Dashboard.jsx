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
} from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [currentView, setCurrentView] = useState("grid"); // grid | list
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

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
    }
  }, [hasShownWelcome]);

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

  // Datos temporales para demostración
  const sidebarItems = [
    { icon: Home, label: "Inicio", count: null, active: true },
    { icon: Folder, label: "Mis archivos", count: 12, active: false },
    { icon: Star, label: "Destacados", count: 3, active: false },
    { icon: Share2, label: "Compartidos", count: 5, active: false },
    { icon: Clock, label: "Recientes", count: null, active: false },
    { icon: Trash2, label: "Papelera", count: 2, active: false },
  ];

  const recentFiles = [
    {
      id: 1,
      name: "Proyecto CloudSync.pdf",
      type: "pdf",
      size: "2.4 MB",
      modified: "Hace 2 horas",
      shared: false,
    },
    {
      id: 2,
      name: "Presentación Q4.pptx",
      type: "presentation",
      size: "8.1 MB",
      modified: "Ayer",
      shared: true,
    },
    {
      id: 3,
      name: "Documentos",
      type: "folder",
      size: "15 archivos",
      modified: "Hace 3 días",
      shared: false,
    },
    {
      id: 4,
      name: "Logo CloudSync.png",
      type: "image",
      size: "342 KB",
      modified: "Hace 1 semana",
      shared: false,
    },
    {
      id: 5,
      name: "Contratos 2025",
      type: "folder",
      size: "8 archivos",
      modified: "Hace 2 semanas",
      shared: true,
    },
    {
      id: 6,
      name: "Análisis competencia.xlsx",
      type: "spreadsheet",
      size: "1.8 MB",
      modified: "Hace 3 semanas",
      shared: false,
    },
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case "folder":
        return <Folder className="w-8 h-8 text-blue-500" />;
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;
      case "image":
        return <Image className="w-8 h-8 text-green-500" />;
      case "presentation":
        return <File className="w-8 h-8 text-orange-500" />;
      case "spreadsheet":
        return <File className="w-8 h-8 text-green-600" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

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
                    {item.count && (
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
          <div className="flex items-center text-sm text-gray-600">
            <Home className="w-4 h-4" />
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-gray-900 font-medium">Inicio</span>
          </div>
        </div>

        {/* Content Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Inicio</h1>

            {/* Toolbar */}
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-4 py-2 bg-[#061a4a] text-white rounded-lg hover:bg-[#082563] transition-colors cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
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

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {/* Quick Access Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Acceso rápido
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => toast.info("Crear nueva carpeta - Próximamente")}
                className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mr-3" />
                <span className="text-gray-600 group-hover:text-blue-700 cursor-pointer">
                  Crear carpeta
                </span>
              </button>
              <button
                onClick={() => toast.info("Subir archivos - Próximamente")}
                className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group"
              >
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-green-500 mr-3" />
                <span className="text-gray-600 group-hover:text-green-700 cursor-pointer">
                  Subir archivos
                </span>
              </button>
              <button
                onClick={() => toast.info("Ver compartidos - Próximamente")}
                className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group"
              >
                <Share2 className="w-6 h-6 text-gray-400 group-hover:text-purple-500 mr-3" />
                <span className="text-gray-600 group-hover:text-purple-700 cursor-pointer">
                  Ver compartidos
                </span>
              </button>
            </div>
          </div>

          {/* Recent Files Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Archivos recientes
            </h2>

            {currentView === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex flex-col items-center">
                      <div className="mb-3">{getFileIcon(file.type)}</div>
                      <h3 className="text-sm font-medium text-gray-900 text-center mb-1 line-clamp-2">
                        {file.name}
                      </h3>
                      <p className="text-xs text-gray-500 text-center">
                        {file.size}
                      </p>
                      <p className="text-xs text-gray-400 text-center">
                        {file.modified}
                      </p>
                      {file.shared && (
                        <div className="mt-2">
                          <Share className="w-3 h-3 text-[#061a4a]" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 text-sm font-medium text-gray-600">
                  <div className="col-span-6">Nombre</div>
                  <div className="col-span-2">Tamaño</div>
                  <div className="col-span-3">Modificado</div>
                  <div className="col-span-1"></div>
                </div>
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors"
                  >
                    <div className="col-span-6 flex items-center">
                      <div className="mr-3">{getFileIcon(file.type)}</div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {file.name}
                        </h3>
                        {file.shared && (
                          <div className="flex items-center mt-1">
                            <Share className="w-3 h-3 text-[#061a4a] mr-1" />
                            <span className="text-xs text-[#061a4a]">
                              Compartido
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center text-sm text-gray-600">
                      {file.size}
                    </div>
                    <div className="col-span-3 flex items-center text-sm text-gray-600">
                      {file.modified}
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <button className="p-1 hover:bg-gray-200 rounded cursor-pointer transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
