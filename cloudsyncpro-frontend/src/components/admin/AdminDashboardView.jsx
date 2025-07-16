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
  Plus,
  Download,
  BarChart3,
  Server,
  HardDrive,
  UserX,
} from "lucide-react";

const AdminDashboardView = ({
  stats,
  users,
  recentActivity,
  formatDate,
  setCurrentView,
  onCreateUser,
  onBackupDatabase,
  onViewLogs,
  onSystemMaintenance,
}) => {
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

  const StatCard = ({
    icon: Icon,
    title,
    value,
    color,
    description,
    trend,
    onClick,
  }) => (
    <div
      className={`bg-white rounded-lg p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-blue-300" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-2 lg:p-3 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
        </div>
        <div className="ml-3 lg:ml-4 flex-1 min-w-0">
          <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">
            {title}
          </p>
          <p className="text-lg lg:text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1 truncate">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Función para calcular porcentajes y tendencias
  const calculateUserPercentage = (active, total) => {
    if (!total || total === 0) return "0%";
    return `${Math.round((active / total) * 100)}%`;
  };

  const calculateNewUsersToday = () => {
    if (!stats?.users?.new_users_today) return "Sin nuevos usuarios";
    return `+${stats.users.new_users_today} hoy`;
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Stats Grid Principal - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard
          icon={Users}
          title="Total Usuarios"
          value={stats?.users?.total_users || 0}
          color="bg-blue-100 text-blue-600"
          description={calculateNewUsersToday()}
          trend={
            stats?.users?.new_users_week
              ? `+${stats.users.new_users_week} esta semana`
              : null
          }
          onClick={() => setCurrentView("users")}
        />

        <StatCard
          icon={UserCheck}
          title="Usuarios Activos"
          value={stats?.users?.active_users || 0}
          color="bg-green-100 text-green-600"
          description={`${calculateUserPercentage(
            stats?.users?.active_users,
            stats?.users?.total_users
          )} del total`}
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

      {/* Stats Grid Secundario - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard
          icon={FileText}
          title="Total Archivos"
          value={stats?.files?.total_files || 0}
          color="bg-indigo-100 text-indigo-600"
          description="Archivos en el sistema"
        />

        <StatCard
          icon={Folder}
          title="Total Carpetas"
          value={stats?.folders?.total_folders || 0}
          color="bg-yellow-100 text-yellow-600"
          description="Carpetas creadas"
        />

        <StatCard
          icon={Database}
          title="Usuarios Inactivos"
          value={stats?.users?.inactive_users || 0}
          color="bg-gray-100 text-gray-600"
          description="Usuarios desactivados"
        />

        <StatCard
          icon={UserX}
          title="Usuarios Baneados"
          value={stats?.users?.banned_users || 0}
          color="bg-red-100 text-red-600"
          description="Usuarios bloqueados"
        />
      </div>

      {/* Dashboard Content Grid - Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Users - CORREGIDO PARA EMAILS LARGOS */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-base lg:text-lg font-medium text-gray-900">
                Usuarios Recientes
              </h3>
              <p className="text-sm text-gray-500">
                Últimos {users?.length || 0} usuarios registrados
              </p>
            </div>
            <button
              onClick={() => setCurrentView("users")}
              className="text-sm text-[#061a4a] hover:text-[#082563] font-medium flex items-center hover:bg-blue-50 px-3 py-1 rounded transition-colors cursor-pointer"
            >
              Ver todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-3 lg:space-y-4">
              {users && users.length > 0 ? (
                users.slice(0, 5).map((user) => (
                  <div
                    key={user.id_user}
                    className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 hover:border-blue-200 transition-all duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-white">
                          {user.name_user?.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        {/* Primera línea: Nombre + Badges */}
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate pr-2">
                            {user.name_user}
                          </p>
                          <div className="flex space-x-1 flex-shrink-0">
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

                        {/* Segunda línea: Email */}
                        <p
                          className="text-sm text-gray-500 break-all mb-1"
                          title={user.email_user}
                        >
                          {user.email_user}
                        </p>

                        {/* Tercera línea: Fecha (solo desktop) */}
                        <p className="text-xs text-gray-400 hidden lg:block">
                          {formatDate(user.created_at_user)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay usuarios para mostrar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Growth Chart con datos reales - Responsive */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-base lg:text-lg font-medium text-gray-900">
                Crecimiento de Usuarios
              </h3>
              <p className="text-sm text-gray-500">
                Registros por mes (últimos 6 meses)
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-3 lg:space-y-4">
              {stats?.growth && stats.growth.length > 0 ? (
                stats.growth.slice(0, 6).map((month, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-sm text-gray-600 font-medium truncate">
                        {month.month}
                      </span>
                    </div>
                    <div className="flex items-center ml-3">
                      <div className="w-16 lg:w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (month.new_users / 10) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 min-w-[60px] lg:min-w-[80px] text-right">
                        +{month.new_users}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Sin datos de crecimiento disponibles
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Los datos aparecerán cuando haya actividad de usuarios
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Status - Responsive */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base lg:text-lg font-medium text-gray-900 flex items-center">
            <Server className="w-5 h-5 mr-2 text-green-500" />
            Estado del Sistema
          </h3>
        </div>
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="text-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-3 animate-pulse"></div>
              <p className="text-sm font-medium text-gray-900">Base de Datos</p>
              <p className="text-xs text-green-600">Operacional</p>
              <p className="text-xs text-gray-400 mt-1">
                {stats?.sessions?.active_sessions || 0} conexiones
              </p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-3 animate-pulse"></div>
              <p className="text-sm font-medium text-gray-900">API</p>
              <p className="text-xs text-green-600">Funcionando</p>
              <p className="text-xs text-gray-400 mt-1">~50ms respuesta</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-3"></div>
              <p className="text-sm font-medium text-gray-900">
                Almacenamiento
              </p>
              <p className="text-xs text-green-600">Disponible</p>
              <p className="text-xs text-gray-400 mt-1">
                {stats?.files?.total_files || 0} archivos
              </p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-3"></div>
              <p className="text-sm font-medium text-gray-900">Backup</p>
              <p className="text-xs text-yellow-600">Pendiente</p>
              <p className="text-xs text-gray-400 mt-1">Hace 2 días</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Responsive */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base lg:text-lg font-medium text-gray-900">
            Acciones Rápidas
          </h3>
          <p className="text-sm text-gray-500">
            Operaciones administrativas frecuentes
          </p>
        </div>
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <button
              onClick={onCreateUser}
              className="flex flex-col lg:flex-row items-center justify-center px-3 lg:px-4 py-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm font-medium text-gray-700 hover:text-blue-700 cursor-pointer"
            >
              <Plus className="w-4 h-4 mb-1 lg:mb-0 lg:mr-2" />
              <span className="text-center lg:text-left">Crear Usuario</span>
            </button>

            <button
              onClick={onBackupDatabase}
              className="flex flex-col lg:flex-row items-center justify-center px-3 lg:px-4 py-3 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-sm font-medium text-gray-700 hover:text-green-700 cursor-pointer"
            >
              <Database className="w-4 h-4 mb-1 lg:mb-0 lg:mr-2" />
              <span className="text-center lg:text-left">Backup BD</span>
            </button>

            <button
              onClick={() => setCurrentView("activity")}
              className="flex flex-col lg:flex-row items-center justify-center px-3 lg:px-4 py-3 border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-sm font-medium text-gray-700 hover:text-purple-700 cursor-pointer"
            >
              <Activity className="w-4 h-4 mb-1 lg:mb-0 lg:mr-2" />
              <span className="text-center lg:text-left">Ver Actividad</span>
            </button>

            <button
              onClick={onSystemMaintenance}
              className="flex flex-col lg:flex-row items-center justify-center px-3 lg:px-4 py-3 border border-gray-300 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors text-sm font-medium text-gray-700 hover:text-yellow-700 cursor-pointer"
            >
              <HardDrive className="w-4 h-4 mb-1 lg:mb-0 lg:mr-2" />
              <span className="text-center lg:text-left">Mantenimiento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alertas importantes - Responsive */}
      {stats?.users?.banned_users > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-3 mt-0.5 flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-red-900">
                Atención: {stats.users.banned_users} usuario(s) baneado(s)
              </p>
              <p className="text-xs text-red-600">
                Revisa la gestión de usuarios para más detalles
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardView;
