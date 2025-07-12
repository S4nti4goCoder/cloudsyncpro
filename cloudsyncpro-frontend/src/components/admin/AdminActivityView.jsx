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
  Calendar,
  Globe,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "sonner";

const AdminActivityView = ({ formatDate }) => {
  // ===========================
  // ESTADO PRINCIPAL
  // ===========================
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false); // ← NUEVO: Control para mostrar más
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    severity: "",
  });
  const [stats, setStats] = useState({
    activitiesToday: 0,
    activeUsers: 0,
    alerts: 0,
    filesUploaded: 0,
  });

  // ===========================
  // CONSTANTES DE LÍMITES
  // ===========================
  const INITIAL_DISPLAY_LIMIT = 5; // Solo mostrar 5 inicialmente
  const MAX_ACTIVITIES_LOAD = 20; // Cargar máximo 20 del backend

  // ===========================
  // EFECTOS
  // ===========================
  useEffect(() => {
    loadActivity();
    loadStats();
  }, []);

  // ===========================
  // FUNCIONES DE CARGA
  // ===========================
  const loadActivity = async () => {
    setLoading(true);
    try {
      // ← MODIFICADO: Solicitar solo 20 actividades en lugar de 50
      const response = await api.get(
        `/admin/activity/recent?limit=${MAX_ACTIVITIES_LOAD}`
      );
      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      console.error("Error loading activity:", error);
      toast.error("Error al cargar actividad del sistema");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get("/admin/dashboard/stats");
      if (response.data.success) {
        const data = response.data.data;
        setStats({
          activitiesToday: activities.filter(
            (a) =>
              new Date(a.timestamp).toDateString() === new Date().toDateString()
          ).length,
          activeUsers: data.sessions?.unique_active_users || 0,
          alerts: activities.filter((a) => a.severity === "error").length,
          filesUploaded: data.files?.total_files || 0,
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // ===========================
  // FUNCIONES DE UTILIDAD
  // ===========================
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

  // ===========================
  // FUNCIONES DE FILTRADO
  // ===========================
  const handleRefresh = async () => {
    await loadActivity();
    await loadStats();
    toast.success("Actividad actualizada");
  };

  const handleExportLogs = () => {
    try {
      const dataStr = JSON.stringify(filteredActivities, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `activity-logs-${
        new Date().toISOString().split("T")[0]
      }.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      toast.success("Logs exportados exitosamente");
    } catch (error) {
      toast.error("Error al exportar logs");
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setShowAll(false); // ← NUEVO: Resetear vista al filtrar
  };

  // Filtrar actividades según los filtros aplicados
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.description
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      activity.user.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = !filters.type || activity.type === filters.type;
    const matchesSeverity =
      !filters.severity || activity.severity === filters.severity;

    return matchesSearch && matchesType && matchesSeverity;
  });

  // ← NUEVO: Determinar qué actividades mostrar
  const displayedActivities = showAll
    ? filteredActivities
    : filteredActivities.slice(0, INITIAL_DISPLAY_LIMIT);

  const hasMoreToShow = filteredActivities.length > INITIAL_DISPLAY_LIMIT;

  // ===========================
  // COMPONENTES INTERNOS (sin cambios)
  // ===========================
  const QuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Actividades Hoy</p>
            <p className="text-lg font-bold text-gray-900">
              {stats.activitiesToday}
            </p>
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
            <p className="text-lg font-bold text-gray-900">
              {stats.activeUsers}
            </p>
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
            <p className="text-lg font-bold text-gray-900">{stats.alerts}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Upload className="w-5 h-5 text-purple-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Total Archivos</p>
            <p className="text-lg font-bold text-gray-900">
              {stats.filesUploaded}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const FiltersSection = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en actividad..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent"
            />
          </div>
        </div>

        {/* Activity Type Filter */}
        <div>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="user_login">Inicios de sesión</option>
            <option value="user_registered">Registros</option>
            <option value="user_logout">Cierres de sesión</option>
            <option value="security_alert">Alertas de seguridad</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange("severity", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#061a4a] focus:border-transparent"
          >
            <option value="">Todas las severidades</option>
            <option value="info">Información</option>
            <option value="success">Éxito</option>
            <option value="warning">Advertencia</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>
    </div>
  );

  // ===========================
  // RENDER PRINCIPAL
  // ===========================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Actividad del Sistema
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitoreo en tiempo real de las actividades más recientes
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </button>
          <button
            onClick={handleExportLogs}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Logs
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Filters */}
      <FiltersSection />

      {/* Activity Feed */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Feed de Actividad
            </h3>
            <span className="text-sm text-gray-500">
              {/* ← MODIFICADO: Mostrar información más clara */}
              Mostrando {displayedActivities.length} de{" "}
              {filteredActivities.length} actividades
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#061a4a] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando actividad...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay actividad que mostrar
            </h3>
            <p className="text-gray-500">
              {filters.search || filters.type || filters.severity
                ? "Intenta ajustar los filtros de búsqueda"
                : "La actividad del sistema aparecerá aquí cuando los usuarios interactúen con la plataforma."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* ← MODIFICADO: Usar displayedActivities en lugar de filteredActivities */}
            {displayedActivities.map((activity) => {
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
                            : new Date(activity.timestamp).toLocaleString(
                                "es-ES"
                              )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>

                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {activity.user}
                        </span>
                        <span className="flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          {activity.ip}
                        </span>
                        {activity.extra_info && (
                          <span className="flex items-center">
                            <Info className="w-3 h-3 mr-1" />
                            {activity.extra_info}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ← NUEVO: Botón para mostrar más/menos */}
        {!loading && filteredActivities.length > 0 && hasMoreToShow && (
          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center text-sm text-[#061a4a] hover:text-[#082563] font-medium transition-colors"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Mostrar menos actividades
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Mostrar {filteredActivities.length -
                    INITIAL_DISPLAY_LIMIT}{" "}
                  actividades más
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Security Alerts Section - ← MODIFICADO: Solo mostrar si hay alertas */}
      {filteredActivities.some((a) => a.severity === "error") && (
        <div className="bg-white rounded-lg border border-red-200">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50">
            <h3 className="text-lg font-medium text-red-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Alertas de Seguridad Recientes
            </h3>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {filteredActivities
                .filter((a) => a.severity === "error")
                .slice(0, 2) // ← MODIFICADO: Solo mostrar 2 alertas máximo
                .map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div className="flex items-center">
                      <XCircle className="w-5 h-5 text-red-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-red-900">
                          {alert.description}
                        </p>
                        <p className="text-xs text-red-600">
                          IP: {alert.ip} - Usuario: {alert.user}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-red-600">
                      {formatDate
                        ? formatDate(alert.timestamp)
                        : new Date(alert.timestamp).toLocaleString("es-ES")}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivityView;
