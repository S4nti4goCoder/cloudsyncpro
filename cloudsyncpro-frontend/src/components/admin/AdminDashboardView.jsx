import {
  Users,
  UserCheck,
  Shield,
  Activity,
  Database,
  Folder,
  FileText,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";

const AdminDashboardView = ({ stats, users, recentActivity, formatDate }) => {
  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      banned: "bg-red-100 text-red-800",
      inactive: "bg-gray-100 text-gray-800",
    };
    return styles[status] || styles.inactive;
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: "bg-purple-100 text-purple-800",
      user: "bg-blue-100 text-blue-800",
    };
    return styles[role] || styles.user;
  };

  const StatCard = ({ icon: Icon, title, value, color, description }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Usuarios"
          value={stats?.users?.total_users || 0}
          color="bg-blue-100 text-blue-600"
          description={`+${stats?.users?.new_users_today || 0} hoy`}
        />

        <StatCard
          icon={UserCheck}
          title="Usuarios Activos"
          value={stats?.users?.active_users || 0}
          color="bg-green-100 text-green-600"
          description={`${Math.round(
            ((stats?.users?.active_users || 0) /
              (stats?.users?.total_users || 1)) *
              100
          )}% del total`}
        />

        <StatCard
          icon={Shield}
          title="Administradores"
          value={stats?.users?.total_admins || 0}
          color="bg-purple-100 text-purple-600"
          description="Usuarios con permisos admin"
        />

        <StatCard
          icon={Activity}
          title="Sesiones Activas"
          value={stats?.sessions?.active_sessions || 0}
          color="bg-orange-100 text-orange-600"
          description={`${
            stats?.sessions?.unique_active_users || 0
          } usuarios únicos`}
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={FileText}
          title="Total Archivos"
          value={stats?.files?.total_files || 0}
          color="bg-indigo-100 text-indigo-600"
        />

        <StatCard
          icon={Folder}
          title="Total Carpetas"
          value={stats?.folders?.total_folders || 0}
          color="bg-yellow-100 text-yellow-600"
        />

        <StatCard
          icon={Database}
          title="Usuarios Baneados"
          value={stats?.users?.banned_users || 0}
          color="bg-red-100 text-red-600"
        />
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Usuarios Recientes
            </h3>
            <button className="text-sm text-[#061a4a] hover:text-[#082563] font-medium flex items-center">
              Ver todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {users.slice(0, 5).map((user) => (
                <div
                  key={user.id_user}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {user.name_user?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name_user}
                      </p>
                      <p className="text-sm text-gray-500">{user.email_user}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(
                        user.role_user
                      )}`}
                    >
                      {user.role_user}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        user.status_user
                      )}`}
                    >
                      {user.status_user}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Crecimiento de Usuarios
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats?.growth?.slice(0, 6).map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">{month.month}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      +{month.new_users} usuarios
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay datos de crecimiento</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Estado del Sistema
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-900">Base de Datos</p>
              <p className="text-xs text-gray-500">Operacional</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-900">API</p>
              <p className="text-xs text-gray-500">Funcionando</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-900">
                Almacenamiento
              </p>
              <p className="text-xs text-gray-500">Disponible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Acciones Rápidas
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
              <Users className="w-4 h-4 mr-2" />
              Crear Usuario
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
              <Database className="w-4 h-4 mr-2" />
              Backup BD
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
              <Activity className="w-4 h-4 mr-2" />
              Ver Logs
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4 mr-2" />
              Mantenimiento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardView;
