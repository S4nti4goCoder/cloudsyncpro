import { useState, useMemo } from "react";
import {
  Archive,
  ArchiveRestore,
  FileIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileArchiveIcon,
  ImageIcon,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useWorkspaceStore, getActiveWorkspace } from "@/store/workspaceStore";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import {
  useArchivedFiles,
  useRestoreFile,
  useBulkRestoreFiles,
} from "@/hooks/useFiles";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";
import { cn } from "@/lib/utils";
import { formatFileSize, getFileColor } from "@/utils/fileUtils";
import { Skeleton } from "@/components/ui/skeleton";
import type { FileRecord } from "@/types/authTypes";

export default function ArchivedPage() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  const activeWorkspace = getActiveWorkspace(
    workspaces ?? [],
    activeWorkspaceId,
  );
  const workspaceId = activeWorkspace?.id ?? "";

  const { data: files, isLoading } = useArchivedFiles(workspaceId);
  const { mutate: restoreFile, isPending: restoring } =
    useRestoreFile(workspaceId);
  const { mutate: bulkRestore, isPending: bulkRestoring } =
    useBulkRestoreFiles(workspaceId);
  const { canEdit } = useWorkspaceRole();

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const isEmpty = !isLoading && !files?.length;
  const pending = restoring || bulkRestoring;

  const allSelected = useMemo(
    () => !!files?.length && files.every((f) => selected.has(f.id)),
    [files, selected],
  );
  const someSelected = selected.size > 0 && !allSelected;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (!files) return;
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(files.map((f) => f.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function restoreAll() {
    if (!files?.length) return;
    bulkRestore(
      files.map((f) => f.id),
      { onSuccess: clearSelection },
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Archivados
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeWorkspace?.name ?? "Sin workspace"} ·{" "}
            {files?.length ?? 0}{" "}
            {(files?.length ?? 0) === 1 ? "archivo" : "archivos"}
          </p>
        </div>

        {canEdit && !isEmpty && !isLoading && (
          <button
            onClick={restoreAll}
            disabled={pending}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 h-9",
              "text-sm font-medium text-foreground border border-border",
              "hover:bg-muted transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <ArchiveRestore className="h-4 w-4" />
            Restaurar todos
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <>
          {canEdit && files && files.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  className="h-3.5 w-3.5 accent-primary"
                />
                {selected.size > 0
                  ? `${selected.size} seleccionado${selected.size > 1 ? "s" : ""}`
                  : "Seleccionar todos"}
              </label>

              {selected.size > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      bulkRestore(Array.from(selected), {
                        onSuccess: clearSelection,
                      })
                    }
                    disabled={pending}
                    className="flex items-center gap-1.5 rounded-md px-2.5 h-7 text-xs font-medium text-foreground border border-border hover:bg-background transition-colors disabled:opacity-50"
                  >
                    <ArchiveRestore className="h-3 w-3" />
                    Restaurar
                  </button>
                  <button
                    onClick={clearSelection}
                    disabled={pending}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                    aria-label="Limpiar selección"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            {files?.map((file) => (
              <ArchivedFileRow
                key={file.id}
                file={file}
                disabled={pending}
                canEdit={canEdit}
                selected={selected.has(file.id)}
                onToggleSelect={() => toggleOne(file.id)}
                onRestore={() => restoreFile(file.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface ArchivedFileRowProps {
  file: FileRecord;
  disabled: boolean;
  canEdit: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onRestore: () => void;
}

function ArchivedFileRow({
  file,
  disabled,
  canEdit,
  selected,
  onToggleSelect,
  onRestore,
}: ArchivedFileRowProps) {
  const colorClass = getFileColor(file.mime_type);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors border",
        selected
          ? "bg-primary/5 border-primary/30"
          : "border-transparent hover:bg-muted/50 hover:border-border",
      )}
    >
      {canEdit && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          disabled={disabled}
          className="h-3.5 w-3.5 accent-primary shrink-0"
        />
      )}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          colorClass,
        )}
      >
        {renderFileTypeIcon(file.mime_type, "h-4 w-4")}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {file.name}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {formatFileSize(file.size)} · Archivado{" "}
          {format(new Date(file.updated_at), "d MMM yyyy", { locale: es })}
        </p>
      </div>

      {canEdit && (
        <button
          onClick={onRestore}
          disabled={disabled}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 h-8",
            "text-xs font-medium text-foreground border border-border",
            "hover:bg-muted transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100",
          )}
        >
          <ArchiveRestore className="h-3.5 w-3.5" />
          Restaurar
        </button>
      )}
    </div>
  );
}

function renderFileTypeIcon(mimeType: string, className: string) {
  if (mimeType.startsWith("image/"))
    return <ImageIcon className={className} />;
  if (mimeType.startsWith("video/"))
    return <FileVideoIcon className={className} />;
  if (mimeType.startsWith("audio/"))
    return <FileAudioIcon className={className} />;
  if (mimeType === "application/pdf")
    return <FileTextIcon className={className} />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return <FileSpreadsheetIcon className={className} />;
  if (mimeType.includes("zip") || mimeType.includes("rar"))
    return <FileArchiveIcon className={className} />;
  return <FileIcon className={className} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 rounded-lg" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
        <Archive className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        No hay archivos archivados
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Los archivos que archives aparecerán aquí. Podrás restaurarlos cuando
        quieras.
      </p>
    </div>
  );
}
