import { Home, Users, Activity, Settings, Shield, Menu } from "lucide-react";

const AdminSidebar = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  currentView,
  setCurrentView,
  stats,
}) => {
  const navigationItems = [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      count: null,
      description: "Resumen del sistema",
    },
    {
      id: "users",
      icon: Users,
      label: "Usuarios",
      count: stats?.users?.total_users || 0,
      description: `${stats?.users?.active_users || 0} activos`,
    },
    {
      id: "activity",
      icon: Activity,
      label: "Actividad",
      count: null,
      description: "Logs del sistema",
    },
  ];

  return (
    <div
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-[#061a4a] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="ml-3 font-semibold text-gray-900">
              Admin Panel
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 mb-1 cursor-pointer group ${
                currentView === item.id
                  ? "bg-[#061a4a]/10 text-[#061a4a] border border-[#061a4a]/20 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
              title={
                !sidebarCollapsed
                  ? item.description
                  : `${item.label} - ${item.description}`
              }
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  currentView === item.id
                    ? "text-[#061a4a]"
                    : "text-gray-600 group-hover:text-gray-700"
                }`}
              />
              {!sidebarCollapsed && (
                <>
                  <div className="ml-3 flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </div>
                  {item.count !== null && (
                    <span
                      className={`ml-2 text-xs px-2 py-1 rounded-full transition-colors ${
                        currentView === item.id
                          ? "bg-[#061a4a] text-white"
                          : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-2 border-t border-gray-100">
        <button className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors">
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="ml-3">Configuración</span>}
        </button>
      </div>

      {/* Toggle Button */}
      <div className="p-2 border-t border-gray-100">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
          title={sidebarCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
        >
          <Menu className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="ml-3">Contraer</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
