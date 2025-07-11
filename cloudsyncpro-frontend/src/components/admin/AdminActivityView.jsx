import {
  Activity,
  Users,
  UserPlus,
  UserX,
  Shield,
  FileText,
  Folder,
  Upload,
  Download,
  Share2,
  Trash2,
  Settings,
  Clock,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";

const AdminActivityView = ({ recentActivity, formatDate }) => {
  // Datos simulados para demostrar funcionalidad completa
  const mockActivities = [
    {
      id: 1,
      type: "user_login",
      description: "quintiagogarciadev@gmail.com inició sesión",
      user: "quintiagogarciadev@gmail.com",
      timestamp: "2025-07-10T18:45:00Z",
      ip: "192.168.1.100",
      severity: "info",
    },
    {
      id: 2,
      type: "user_registered",
      description: "santiago@gmail.com se registró en el sistema",
      user: "santiago@gmail.com",
      timestamp: "2025-07-10T18:41:46Z",
      ip: "192.168.1.101",
      severity: "success",
    },
    {
      id: 3,
      type: "file_upload",
      description: "Usuario subió archivo: proyecto-final.pdf",
      user: "quintiagogarciadev@gmail.com",
      timestamp: "2025-07-10T17:30:00Z",
      ip: "192.168.1.100",
      severity: "info",
    },
    {
      id: 4,
      type: "admin_action",
      description: "Rol de usuario modificado: santiago@gmail.com → user",
      user: "quintiagogarciadev@gmail.com",
      timestamp: "2025-07-10T16:20:00Z",
      ip: "192.168.1.100",
      severity: "warning",
    },
    {
      id: 5,
      type: "user_logout",
      description: "Usuario cerró sesión correctamente",
      user: "santiago@gmail.com",
      timestamp: "2025-07-10T15:45:00Z",
      ip: "192.168.1.101",
      severity: "info",
    },
    {
      id: 6,
      type: "folder_created",
      description: "Nueva carpeta creada: Documentos Importantes",
      user: "quintiagogarciadev@gmail.com",
      timestamp: "2025-07-10T14:30:00Z",
      ip: "192.168.1.100",
      severity: "info",
    },
    {
      id: 7,
      type: "security_alert",
      description: "Múltiples intentos de login fallidos detectados",
      user: "unknown@example.com",
      timestamp: "2025-07-10T13:15:00Z",
      ip: "203.0.113.42",
      severity: "error",
    },
    {
      id: 8,
      type: "file_shared",
      description: "Archivo compartido: presentacion-q4.pptx",
      user: "quintiagogarciadev@gmail.com",
      timestamp: "2025-07-10T12:00:00Z",
      ip: "192.168.1.100",
      severity: "info",
    },
  ];

  const getActivityIcon = (type) => {
    const icons = {
      user_login: UserPlus,
      user_logout: UserX,
      user_registered: Users,
      file_upload: Upload,
      file_download: Download,
      file_shared: Share2,
      folder_created: Folder,
      admin_action: Shield,
      security_alert: AlertTriangle,
      system_update: Settings,
    };
    return icons[type] || Activity;
  };

  const getActivityColor = (severity) => {
    const colors = {
      info: "bg-blue-100 text-blue-600",
      success: "bg-green-100 text-green-600",
      warning: "bg-yellow-100 text-yellow-600",
      error: "bg-red-100 text-red-600",
    };
    return colors[severity] || colors.info;
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      info: "bg-blue-100 text-blue-800 border-blue-200",
      success: "bg-green-100 text-green-800 border-green-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      error: "bg-red-100 text-red-800 border-red-200",
    };
    return badges[severity] || badges.info;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      info: Info,
      success: CheckCircle,
      warning: AlertTriangle,
      error: XCircle,
    };
    const Icon = icons[severity] || Info;
    return <Icon className="w-4 h-4" />;
  };

  const getActivityTypeLabel = (type) => {
    const labels = {
      user_login: "Inicio de sesión",
      user_logout: "Cierre de sesión",
      user_registered: "Registro de usuario",
      file_upload: "Subida de archivo",
      file_download: "Descarga de archivo",
      file_shared: "Archivo compartido",
      folder_created: "Carpeta creada",
      admin_action: "Acción administrativa",
      security_alert: "Alerta de seguridad",
      system_update: "Actualización del sistema",
    };
    return labels[type] || "Actividad desconocida";
  };

  const activityData =
    mockActivities.length > 0 ? mockActivities : recentActivity;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Actividad del Sistema
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitoreo en tiempo real de todas las actividades del sistema
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <Download className="w-4 h-4 mr-2" />
            Exportar Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en actividad..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent"
              />
            </div>
          </div>

          {/* Activity Type Filter */}
          <div>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent">
              <option value="">Todos los tipos</option>
              <option value="user_login">Inicios de sesión</option>
              <option value="user_registered">Registros</option>
              <option value="file_upload">Subidas de archivos</option>
              <option value="admin_action">Acciones admin</option>
              <option value="security_alert">Alertas de seguridad</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent">
              <option value="">Todas las severidades</option>
              <option value="info">Información</option>
              <option value="success">Éxito</option>
              <option value="warning">Advertencia</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Actividades Hoy
              </p>
              <p className="text-lg font-bold text-gray-900">247</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Usuarios Activos
              </p>
              <p className="text-lg font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Alertas</p>
              <p className="text-lg font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Upload className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Archivos Subidos
              </p>
              <p className="text-lg font-bold text-gray-900">18</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Feed de Actividad
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {activityData.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div
                key={activity.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-lg ${getActivityColor(
                      activity.severity
                    )}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {getActivityTypeLabel(activity.type)}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getSeverityBadge(
                            activity.severity
                          )}`}
                        >
                          {getSeverityIcon(activity.severity)}
                          <span className="ml-1 capitalize">
                            {activity.severity}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate
                          ? formatDate(activity.timestamp)
                          : new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>

                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Usuario: {activity.user}</span>
                      <span>IP: {activity.ip}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More */}
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <button className="text-sm text-[#061a4a] hover:text-[#082563] font-medium">
            Cargar más actividades
          </button>
        </div>
      </div>

      {/* Security Alerts */}
      <div className="bg-white rounded-lg border border-red-200">
        <div className="px-6 py-4 border-b border-red-200 bg-red-50">
          <h3 className="text-lg font-medium text-red-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Alertas de Seguridad Recientes
          </h3>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    Múltiples intentos de login fallidos
                  </p>
                  <p className="text-xs text-red-600">
                    IP: 203.0.113.42 - 5 intentos en 10 minutos
                  </p>
                </div>
              </div>
              <span className="text-xs text-red-600">Hace 2 horas</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Acceso desde ubicación inusual
                  </p>
                  <p className="text-xs text-yellow-600">
                    Usuario: santiago@gmail.com desde nueva IP
                  </p>
                </div>
              </div>
              <span className="text-xs text-yellow-600">Hace 4 horas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {(!activityData || activityData.length === 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay actividad reciente
          </h3>
          <p className="text-gray-500">
            La actividad del sistema aparecerá aquí cuando los usuarios
            interactúen con la plataforma.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminActivityView;
