import {
  LogOut,
  Bell,
  Search,
  Menu,
  ChevronDown,
  User,
  Settings,
  Shield,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const AdminNavbar = ({
  currentView,
  user,
  sidebarCollapsed,
  setSidebarCollapsed,
  handleLogout,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setUserDropdownOpen(false);
    // TODO: Implementar modal de perfil
    console.log("Ver perfil clicked");
  };

  const handleSettingsClick = () => {
    setUserDropdownOpen(false);
    // TODO: Implementar configuraciones
    console.log("Configuraciones clicked");
  };

  const handleLogoutClick = () => {
    setUserDropdownOpen(false);
    handleLogout();
  };
  const getViewTitle = (view) => {
    const titles = {
      dashboard: "Panel de Administración",
      users: "Gestión de Usuarios",
      activity: "Actividad del Sistema",
      settings: "Configuración del Sistema",
    };
    return titles[view] || "Administración";
  };

  const getViewDescription = (view) => {
    const descriptions = {
      dashboard: "Resumen general del sistema",
      users: "Administrar usuarios y permisos",
      activity: "Monitoreo de actividad del sistema",
      settings: "Configuraciones y ajustes generales",
    };
    return descriptions[view] || "";
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title={sidebarCollapsed ? "Mostrar sidebar" : "Ocultar sidebar"}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {getViewTitle(currentView)}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {getViewDescription(currentView)}
            </p>
          </div>
        </div>

        {/* Center Section - Search (visible on larger screens) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios, actividad..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* System Status Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700 font-medium">
              Sistema Operativo
            </span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </span>
          </button>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-3 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-r-lg transition-colors cursor-pointer"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name_user}
                </p>
                <div className="flex items-center justify-end mt-1">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    <Shield className="w-3 h-3 mr-1" />
                    Administrador
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 bg-[#061a4a] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name_user?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  userDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name_user}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email_user}</p>
                  <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    <Shield className="w-3 h-3 mr-1" />
                    Administrador
                  </span>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    Ver Perfil
                  </button>

                  <button
                    onClick={handleSettingsClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-400" />
                    Configuraciones
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-3 text-red-500" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent text-sm"
          />
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
