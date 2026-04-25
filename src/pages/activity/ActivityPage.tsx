import { useMemo, useState } from "react";
import {
  Activity,
  Filter,
  X,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useWorkspaceStore, getActiveWorkspace } from "@/store/workspaceStore";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useActivities } from "@/hooks/useActivity";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ACTION_CONFIG, renderActionIcon, groupByDay } from "@/utils/activityUtils";
import type { ActivityAction } from "@/types/authTypes";
import type { ActivityWithUser } from "@/services/activityService";

const PAGE_SIZE = 50;

export default function ActivityPage() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  const activeWorkspace = getActiveWorkspace(
    workspaces ?? [],
    activeWorkspaceId,
  );
  const workspaceId = activeWorkspace?.id ?? "";

  const [selectedActions, setSelectedActions] = useState<ActivityAction[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);

  const filters = useMemo(
    () => ({
      actions: selectedActions.length ? selectedActions : undefined,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to + "T23:59:59").toISOString() : undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
    [selectedActions, from, to, page],
  );

  const { data, isLoading, isFetching } = useActivities(workspaceId, filters);

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const hasMore = (page + 1) * PAGE_SIZE < total;
  const hasFilters = selectedActions.length > 0 || from !== "" || to !== "";

  const grouped = useMemo(() => groupByDay(items), [items]);

  function toggleAction(action: ActivityAction) {
    setPage(0);
    setSelectedActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action],
    );
  }

  function clearFilters() {
    setSelectedActions([]);
    setFrom("");
    setTo("");
    setPage(0);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Actividad
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeWorkspace?.name ?? "Sin workspace"} ·{" "}
            {total.toLocaleString()} {total === 1 ? "evento" : "eventos"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ActionFilter
            selected={selectedActions}
            onToggle={toggleAction}
          />
          <DateRangeFilter
            from={from}
            to={to}
            onChange={(f, t) => {
              setFrom(f);
              setTo(t);
              setPage(0);
            }}
          />
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 h-9 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      {isLoading && page === 0 ? (
        <LoadingSkeleton />
      ) : items.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <DayGroup key={group.date} label={group.label} items={group.items} />
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={isFetching}
                className="flex items-center gap-2 rounded-lg border border-border px-4 h-9 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
              >
                {isFetching ? "Cargando..." : "Cargar más"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// DayGroup
// ============================================

function DayGroup({
  label,
  items,
}: {
  label: string;
  items: ActivityWithUser[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {items.map((item) => (
          <ActivityItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

// ============================================
// ActivityItem
// ============================================

function ActivityItem({ item }: { item: ActivityWithUser }) {
  const config = ACTION_CONFIG[item.action];
  const userName = item.user?.full_name ?? item.user?.email ?? "Usuario";
  const initials = (userName)
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={item.user?.avatar_url ?? ""} />
        <AvatarFallback className="bg-[#0f172a] text-white text-[10px]">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-tight">
          <span className="font-medium">{userName}</span>{" "}
          <span className="text-muted-foreground">{config.verb}</span>{" "}
          {item.resource_name && (
            <span className="font-medium text-foreground">
              {item.resource_name}
            </span>
          )}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {format(new Date(item.created_at), "HH:mm", { locale: es })} ·{" "}
          {item.resource_type ?? "sistema"}
        </p>
      </div>

      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
          config.color,
        )}
      >
        {renderActionIcon(item.action, "h-3.5 w-3.5")}
      </div>
    </div>
  );
}

// ============================================
// Filters
// ============================================

function ActionFilter({
  selected,
  onToggle,
}: {
  selected: ActivityAction[];
  onToggle: (a: ActivityAction) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-lg border border-border px-3 h-9 text-sm font-medium transition-colors",
            selected.length > 0
              ? "bg-primary/10 text-primary border-primary/30"
              : "text-foreground hover:bg-muted",
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          Acción
          {selected.length > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {selected.length}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1.5">
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Filtrar por acción
          </p>
        </div>
        <div className="max-h-64 overflow-y-auto space-y-0.5">
          {(Object.keys(ACTION_CONFIG) as ActivityAction[]).map((action) => {
            const isSelected = selected.includes(action);
            const config = ACTION_CONFIG[action];
            return (
              <button
                key={action}
                onClick={() => onToggle(action)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                  isSelected ? "bg-primary/10" : "hover:bg-muted",
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                    config.color,
                  )}
                >
                  {renderActionIcon(action, "h-3 w-3")}
                </div>
                <span className="flex-1 text-xs text-foreground">
                  {config.label}
                </span>
                {isSelected && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DateRangeFilter({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  const hasRange = from !== "" || to !== "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-lg border border-border px-3 h-9 text-sm font-medium transition-colors",
            hasRange
              ? "bg-primary/10 text-primary border-primary/30"
              : "text-foreground hover:bg-muted",
          )}
        >
          <Calendar className="h-3.5 w-3.5" />
          {hasRange ? formatRangeLabel(from, to) : "Fechas"}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3 space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Desde
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => onChange(e.target.value, to)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Hasta
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => onChange(from, e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {hasRange && (
          <button
            onClick={() => onChange("", "")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpiar fechas
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ============================================
// Empty + Loading
// ============================================

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
        <Activity className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        {hasFilters ? "Sin resultados" : "Aún no hay actividad"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-4">
        {hasFilters
          ? "Probá ajustar los filtros para ver más eventos."
          : "La actividad del workspace aparecerá acá cuando se realicen acciones."}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="rounded-lg border border-border px-4 h-9 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-24 rounded-md" />
      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/3 rounded" />
            </div>
            <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Helpers
// ============================================

function formatRangeLabel(from: string, to: string): string {
  if (from && to) {
    return `${format(new Date(from), "d MMM", { locale: es })} – ${format(new Date(to), "d MMM", { locale: es })}`;
  }
  if (from) return `Desde ${format(new Date(from), "d MMM", { locale: es })}`;
  if (to) return `Hasta ${format(new Date(to), "d MMM", { locale: es })}`;
  return "Fechas";
}
