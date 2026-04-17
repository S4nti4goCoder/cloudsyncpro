import {
  Upload,
  Download,
  Eye,
  Move,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Share2,
  Link2Off,
  FolderPlus,
  FileEdit,
  GitBranch,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import type { ActivityAction } from "@/types/authTypes";
import type { ActivityWithUser } from "@/services/activityService";

export interface ActionConfig {
  label: string;
  verb: string;
  color: string;
}

export const ACTION_CONFIG: Record<ActivityAction, ActionConfig> = {
  upload: {
    label: "Subir",
    verb: "subió",
    color: "bg-green-500/10 text-green-500",
  },
  download: {
    label: "Descargar",
    verb: "descargó",
    color: "bg-blue-500/10 text-blue-500",
  },
  view: {
    label: "Ver",
    verb: "visualizó",
    color: "bg-slate-500/10 text-slate-500",
  },
  move: {
    label: "Mover",
    verb: "movió",
    color: "bg-orange-500/10 text-orange-500",
  },
  rename: {
    label: "Renombrar",
    verb: "renombró",
    color: "bg-purple-500/10 text-purple-500",
  },
  delete: {
    label: "Eliminar",
    verb: "eliminó",
    color: "bg-red-500/10 text-red-500",
  },
  archive: {
    label: "Archivar",
    verb: "archivó",
    color: "bg-yellow-500/10 text-yellow-500",
  },
  restore: {
    label: "Restaurar",
    verb: "restauró",
    color: "bg-cyan-500/10 text-cyan-500",
  },
  share: {
    label: "Compartir",
    verb: "compartió",
    color: "bg-blue-500/10 text-blue-500",
  },
  unshare: {
    label: "Dejar de compartir",
    verb: "dejó de compartir",
    color: "bg-slate-500/10 text-slate-500",
  },
  create_folder: {
    label: "Crear carpeta",
    verb: "creó la carpeta",
    color: "bg-blue-500/10 text-blue-500",
  },
  update_metadata: {
    label: "Actualizar metadatos",
    verb: "actualizó metadatos de",
    color: "bg-slate-500/10 text-slate-500",
  },
  create_version: {
    label: "Nueva versión",
    verb: "creó una versión de",
    color: "bg-indigo-500/10 text-indigo-500",
  },
};

export function renderActionIcon(action: ActivityAction, className: string) {
  switch (action) {
    case "upload":
      return <Upload className={className} />;
    case "download":
      return <Download className={className} />;
    case "view":
      return <Eye className={className} />;
    case "move":
      return <Move className={className} />;
    case "rename":
      return <Pencil className={className} />;
    case "delete":
      return <Trash2 className={className} />;
    case "archive":
      return <Archive className={className} />;
    case "restore":
      return <ArchiveRestore className={className} />;
    case "share":
      return <Share2 className={className} />;
    case "unshare":
      return <Link2Off className={className} />;
    case "create_folder":
      return <FolderPlus className={className} />;
    case "update_metadata":
      return <FileEdit className={className} />;
    case "create_version":
      return <GitBranch className={className} />;
  }
}

export interface DayGroupData {
  date: string;
  label: string;
  items: ActivityWithUser[];
}

export function groupByDay(items: ActivityWithUser[]): DayGroupData[] {
  const groups = new Map<string, ActivityWithUser[]>();

  for (const item of items) {
    const date = new Date(item.created_at);
    const key = format(date, "yyyy-MM-dd");
    const existing = groups.get(key) ?? [];
    existing.push(item);
    groups.set(key, existing);
  }

  return Array.from(groups.entries()).map(([date, dayItems]) => ({
    date,
    label: formatDayLabel(new Date(date + "T00:00:00")),
    items: dayItems,
  }));
}

export function formatDayLabel(date: Date): string {
  if (isToday(date)) return "Hoy";
  if (isYesterday(date)) return "Ayer";
  return format(date, "EEEE, d 'de' MMMM", { locale: es });
}
