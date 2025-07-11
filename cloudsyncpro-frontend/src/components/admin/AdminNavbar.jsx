import { LogOut, Bell, Search, Menu } from "lucide-react";

const AdminNavbar = ({
  currentView,
  user,
  sidebarCollapsed,
  setSidebarCollapsed,
  handleLogout,
}) => {
  const getViewTitle = (view) => {
    const titles = {
      dashboard: "Panel de Administración",
      users: "Gestión de Usuarios",
      activity: "Actividad del Sistema",
    };
    return titles[view] || "Administración";
  };

  const getViewDescription = (view) => {
    const descriptions = {
      dashboard: "Resumen general del sistema",
      users: "Administrar usuarios y permisos",
      activity: "Monitoreo de actividad del sistema",
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:hidden"
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

          {/* User Info */}
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.name_user}
              </p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>

            <div className="w-8 h-8 bg-[#061a4a] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name_user?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
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
