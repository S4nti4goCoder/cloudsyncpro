import { useNavigate } from "react-router-dom";
import {
  FileIcon,
  FolderIcon,
  Users,
  HardDrive,
  TrendingUp,
  Upload,
  ArrowRight,
  ImageIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileVideoIcon,
  Archive,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useWorkspaceStore, getActiveWorkspace } from "@/store/workspaceStore";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import {
  useWorkspaceStats,
  useGlobalStats,
  useRecentFiles,
  useUploadActivity,
} from "@/hooks/useDashboard";
import { formatFileSize, getFileColor } from "@/utils/fileUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const PIE_COLORS = {
  images: "#8b5cf6",
  videos: "#ec4899",
  audio: "#f97316",
  documents: "#3b82f6",
  spreadsheets: "#22c55e",
  other: "#94a3b8",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  const activeWorkspace = getActiveWorkspace(
    workspaces ?? [],
    activeWorkspaceId,
  );
  const workspaceId = activeWorkspace?.id ?? "";

  const { data: globalStats, isLoading: globalLoading } = useGlobalStats();
  const { data: wsStats, isLoading: wsLoading } =
    useWorkspaceStats(workspaceId);
  const { data: recentFiles, isLoading: recentLoading } =
    useRecentFiles(workspaceId);
  const { data: activity, isLoading: activityLoading } =
    useUploadActivity(workspaceId);

  const pieData = wsStats?.files_by_type
    ? Object.entries(wsStats.files_by_type as Record<string, number>).map(
        ([key, value]) => ({
          name: translateFileType(key),
          value,
          color: PIE_COLORS[key as keyof typeof PIE_COLORS] ?? PIE_COLORS.other,
        }),
      )
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Resumen general de tu actividad en CloudSyncPro
        </p>
      </div>

      {/* Global stats */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Resumen global
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total archivos"
            value={globalStats?.totalFiles ?? 0}
            format="number"
            icon={FileIcon}
            color="text-blue-500 bg-blue-500/10"
            isLoading={globalLoading}
          />
          <StatCard
            title="Almacenamiento"
            value={globalStats?.totalSize ?? 0}
            format="size"
            icon={HardDrive}
            color="text-purple-500 bg-purple-500/10"
            isLoading={globalLoading}
          />
          <StatCard
            title="Workspaces"
            value={globalStats?.totalWorkspaces ?? 0}
            format="number"
            icon={Users}
            color="text-green-500 bg-green-500/10"
            isLoading={globalLoading}
          />
          <StatCard
            title="Carpetas"
            value={globalStats?.totalFolders ?? 0}
            format="number"
            icon={FolderIcon}
            color="text-orange-500 bg-orange-500/10"
            isLoading={globalLoading}
          />
        </div>
      </div>

      {/* Workspace stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate min-w-0">
            Workspace activo — {activeWorkspace?.name}
          </p>
          <button
            onClick={() => navigate("/files")}
            className="flex shrink-0 items-center gap-1 text-xs text-primary hover:underline"
          >
            Ver archivos
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            title="Archivos"
            value={wsStats?.total_files ?? 0}
            format="number"
            icon={FileIcon}
            color="text-blue-500 bg-blue-500/10"
            isLoading={wsLoading}
          />
          <StatCard
            title="Almacenamiento"
            value={wsStats?.total_size ?? 0}
            format="size"
            icon={HardDrive}
            color="text-purple-500 bg-purple-500/10"
            isLoading={wsLoading}
          />
          <StatCard
            title="Carpetas"
            value={wsStats?.total_folders ?? 0}
            format="number"
            icon={FolderIcon}
            color="text-orange-500 bg-orange-500/10"
            isLoading={wsLoading}
          />
          <StatCard
            title="Archivados"
            value={wsStats?.total_archived ?? 0}
            format="number"
            icon={Archive}
            color="text-amber-500 bg-amber-500/10"
            isLoading={wsLoading}
          />
          <StatCard
            title="En papelera"
            value={wsStats?.total_trashed ?? 0}
            format="number"
            icon={Trash2}
            color="text-red-500 bg-red-500/10"
            isLoading={wsLoading}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upload activity */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Actividad de subidas
              </p>
              <p className="text-xs text-muted-foreground">
                Archivos subidos por día
              </p>
            </div>
          </div>

          {activityLoading ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : !activity?.length ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Upload className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Sin actividad aún</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={activity}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value) => [`${value ?? 0} archivos`, "Subidas"]}
                />
                <Bar
                  dataKey="uploads"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Files by type */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <FileIcon className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Archivos por tipo
              </p>
              <p className="text-xs text-muted-foreground">
                Distribución en este workspace
              </p>
            </div>
          </div>

          {wsLoading ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : !pieData.length ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <FileIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Sin archivos aún</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value, name) => [
                    `${value ?? 0} archivo${Number(value ?? 0) !== 1 ? "s" : ""}`,
                    name,
                  ]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent files */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Archivos recientes
          </p>
          <button
            onClick={() => navigate("/files")}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Ver todos
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {recentLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : !recentFiles?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                Sin archivos recientes
              </p>
              <button
                onClick={() => navigate("/files")}
                className="mt-3 text-xs text-primary hover:underline"
              >
                Subir primer archivo
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentFiles.map((file) => {
                const colorClass = getFileColor(file.mime_type);
                const Icon = getFileIconComponent(file.mime_type);
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(
                        file.folder_id
                          ? `/files?folder=${file.folder_id}`
                          : "/files",
                      )
                    }
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        colorClass,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(file.created_at), "d MMM", {
                        locale: es,
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// StatCard
// ============================================

interface StatCardProps {
  title: string;
  value: number;
  format: "number" | "size";
  icon: React.ElementType;
  color: string;
  isLoading: boolean;
}

function StatCard({
  title,
  value,
  format: fmt,
  icon: Icon,
  color,
  isLoading,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            color,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="h-7 w-20 rounded-md" />
      ) : (
        <p className="text-xl sm:text-2xl font-bold text-foreground truncate">
          {fmt === "size" ? formatFileSize(value) : value.toLocaleString()}
        </p>
      )}
    </div>
  );
}

// ============================================
// Helpers
// ============================================

function translateFileType(key: string): string {
  const map: Record<string, string> = {
    images: "Imágenes",
    videos: "Videos",
    audio: "Audio",
    documents: "Documentos",
    spreadsheets: "Hojas de cálculo",
    other: "Otros",
  };
  return map[key] ?? key;
}

function getFileIconComponent(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.startsWith("video/")) return FileVideoIcon;
  if (mimeType === "application/pdf") return FileTextIcon;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return FileSpreadsheetIcon;
  return FileIcon;
}
