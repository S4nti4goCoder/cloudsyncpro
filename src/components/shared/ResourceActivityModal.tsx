import { useMemo } from "react";
import { Activity, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useResourceActivities } from "@/hooks/useActivity";
import { ACTION_CONFIG, renderActionIcon, groupByDay } from "@/utils/activityUtils";
import { cn } from "@/lib/utils";
import type { ActivityWithUser } from "@/services/activityService";

interface ResourceActivityModalProps {
  resourceId: string | null;
  resourceName: string;
  resourceType: "file" | "folder";
  workspaceId?: string;
  open: boolean;
  onClose: () => void;
}

export function ResourceActivityModal({
  resourceId,
  resourceName,
  resourceType,
  workspaceId,
  open,
  onClose,
}: ResourceActivityModalProps) {
  const { data: items, isLoading } = useResourceActivities(open ? resourceId : null, workspaceId);
  const grouped = useMemo(() => groupByDay(items ?? []), [items]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Actividad de {resourceType === "folder" ? "carpeta" : "archivo"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground truncate">{resourceName}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !items?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-3">
                <Activity className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Sin actividad registrada
              </p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Las acciones sobre este {resourceType === "folder" ? "carpeta" : "archivo"} aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              {grouped.map((group) => (
                <div key={group.date} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </p>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <ActivityRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActivityRow({ item }: { item: ActivityWithUser }) {
  const config = ACTION_CONFIG[item.action];
  const userName = item.user?.full_name ?? item.user?.email ?? "Usuario";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/30 transition-colors">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage src={item.user?.avatar_url ?? ""} />
        <AvatarFallback className="bg-[#0f172a] text-white text-[9px]">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground leading-tight">
          <span className="font-medium">{userName}</span>{" "}
          <span className="text-muted-foreground">{config.verb}</span>
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {format(new Date(item.created_at), "HH:mm", { locale: es })}
          {item.metadata && renderMetadata(item.metadata as Record<string, unknown>)}
        </p>
      </div>

      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
          config.color,
        )}
      >
        {renderActionIcon(item.action, "h-3 w-3")}
      </div>
    </div>
  );
}

function renderMetadata(metadata: Record<string, unknown>): string {
  const parts: string[] = [];

  if (metadata.previous_name) {
    parts.push(`antes: ${metadata.previous_name}`);
  }
  if (metadata.permanent) {
    parts.push("permanente");
  }
  if (metadata.share_type) {
    parts.push(metadata.share_type === "public" ? "público" : "privado");
  }

  return parts.length > 0 ? ` · ${parts.join(", ")}` : "";
}
