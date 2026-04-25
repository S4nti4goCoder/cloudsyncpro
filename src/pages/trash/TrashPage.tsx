import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fileService } from "@/services/fileService";
import { folderService } from "@/services/folderService";
import { invalidateDashboardQueries } from "@/hooks/useDashboard";
import {
  Trash2,
  ArchiveRestore,
  FileIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileArchiveIcon,
  FolderIcon,
  ImageIcon,
  Grid3x3,
  List,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useWorkspaceStore, getActiveWorkspace } from "@/store/workspaceStore";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import {
  useDeletedFiles,
  useRestoreFile,
  useDeleteFile,
  useBulkRestoreFiles,
  useBulkDeleteFiles,
} from "@/hooks/useFiles";
import {
  useTrashedFolders,
  useRestoreFolder,
  usePermanentDeleteFolder,
  useBulkRestoreFolders,
  useBulkPermanentDeleteFolders,
} from "@/hooks/useFolders";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";
import { cn } from "@/lib/utils";
import { formatFileSize, getFileColor } from "@/utils/fileUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { FileRecord, Folder as FolderType } from "@/types/authTypes";

type ViewMode = "grid" | "list";

export default function TrashPage() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  const activeWorkspace = getActiveWorkspace(
    workspaces ?? [],
    activeWorkspaceId,
  );
  const workspaceId = activeWorkspace?.id ?? "";

  const { data: files, isLoading: filesLoading } =
    useDeletedFiles(workspaceId);
  const { data: allTrashedFolders, isLoading: foldersLoading } =
    useTrashedFolders(workspaceId);

  // Top-level trashed folders (for display) and a lookup of all trashed
  // folder names (for the "Dentro de …" badge on files whose parent is
  // also in trash).
  const folders = useMemo(() => {
    const list = allTrashedFolders ?? [];
    const ids = new Set(list.map((f) => f.id));
    return list.filter((f) => !f.parent_id || !ids.has(f.parent_id));
  }, [allTrashedFolders]);
  const trashedFolderNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of allTrashedFolders ?? []) map.set(f.id, f.name);
    return map;
  }, [allTrashedFolders]);

  const { mutate: restoreFile, isPending: restoring } =
    useRestoreFile(workspaceId);
  const { mutate: deleteFile, isPending: deleting } =
    useDeleteFile(workspaceId);
  const { mutate: restoreFolder, isPending: restoringFolder } =
    useRestoreFolder(workspaceId);
  const { mutate: permanentDeleteFolder, isPending: deletingFolder } =
    usePermanentDeleteFolder(workspaceId);
  const { mutateAsync: bulkRestoreFiles, isPending: bulkRestoringFiles } =
    useBulkRestoreFiles(workspaceId);
  const { mutateAsync: bulkDeleteFiles, isPending: bulkDeletingFiles } =
    useBulkDeleteFiles(workspaceId);
  const {
    mutateAsync: bulkRestoreFolders,
    isPending: bulkRestoringFolders,
  } = useBulkRestoreFolders(workspaceId);
  const {
    mutateAsync: bulkPermanentDeleteFolders,
    isPending: bulkDeletingFolders,
  } = useBulkPermanentDeleteFolders(workspaceId);
  const queryClient = useQueryClient();
  const { mutate: emptyTrashAll, isPending: emptying } = useMutation({
    mutationFn: async (args: { folderIds: string[]; fileCount: number }) => {
      const ops: Promise<unknown>[] = [];
      if (args.folderIds.length)
        ops.push(folderService.bulkPermanentDeleteFolders(args.folderIds));
      if (args.fileCount > 0) ops.push(fileService.emptyTrash(workspaceId));
      await Promise.all(ops);
      return args.folderIds.length + args.fileCount;
    },
    onSuccess: (count) => {
      void queryClient.invalidateQueries({ queryKey: ["files"] });
      void queryClient.invalidateQueries({ queryKey: ["folders"] });
      invalidateDashboardQueries(queryClient, workspaceId);
      toast.success(
        `Papelera vaciada (${count} ${count === 1 ? "elemento" : "elementos"})`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Error al vaciar la papelera");
    },
  });
  const { canEdit } = useWorkspaceRole();

  const [fileToDelete, setFileToDelete] = useState<FileRecord | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showEmptyTrash, setShowEmptyTrash] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const folderIdSet = useMemo(
    () => new Set(folders.map((f) => f.id)),
    [folders],
  );
  const fileIdSet = useMemo(
    () => new Set((files ?? []).map((f) => f.id)),
    [files],
  );

  const selectedFolderIds = useMemo(
    () => Array.from(selected).filter((id) => folderIdSet.has(id)),
    [selected, folderIdSet],
  );
  const selectedFileIds = useMemo(
    () => Array.from(selected).filter((id) => fileIdSet.has(id)),
    [selected, fileIdSet],
  );

  const totalCount = (folders?.length ?? 0) + (files?.length ?? 0);
  const isLoading = filesLoading || foldersLoading;
  const isEmpty = !isLoading && !totalCount;
  const bulkPending =
    bulkRestoringFiles ||
    bulkDeletingFiles ||
    bulkRestoringFolders ||
    bulkDeletingFolders;
  const pending =
    restoring ||
    deleting ||
    restoringFolder ||
    deletingFolder ||
    bulkPending ||
    emptying;

  const allSelected = totalCount > 0 && selected.size === totalCount;
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
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(
        new Set([
          ...folders.map((f) => f.id),
          ...(files ?? []).map((f) => f.id),
        ]),
      );
    }
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function confirmDelete() {
    if (!fileToDelete) return;
    deleteFile(fileToDelete.id, {
      onSuccess: () => setFileToDelete(null),
    });
  }

  async function handleBulkRestore() {
    const ops: Promise<unknown>[] = [];
    if (selectedFolderIds.length) ops.push(bulkRestoreFolders(selectedFolderIds));
    if (selectedFileIds.length) ops.push(bulkRestoreFiles(selectedFileIds));
    if (!ops.length) return;
    try {
      await Promise.all(ops);
      clearSelection();
    } catch {
      // errors surfaced via toast in each mutation's onError
    }
  }

  async function confirmBulkDelete() {
    const ops: Promise<unknown>[] = [];
    if (selectedFolderIds.length)
      ops.push(bulkPermanentDeleteFolders(selectedFolderIds));
    if (selectedFileIds.length) ops.push(bulkDeleteFiles(selectedFileIds));
    if (!ops.length) return;
    try {
      await Promise.all(ops);
      clearSelection();
      setShowBulkDelete(false);
    } catch {
      // toast already shown
    }
  }

  function confirmEmptyTrash() {
    emptyTrashAll(
      { folderIds: folders.map((f) => f.id), fileCount: files?.length ?? 0 },
      {
        onSuccess: () => {
          clearSelection();
          setShowEmptyTrash(false);
        },
      },
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Papelera
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeWorkspace?.name ?? "Sin workspace"} · {totalCount}{" "}
            {totalCount === 1 ? "elemento" : "elementos"}
          </p>
        </div>

        {canEdit && totalCount > 0 && !isLoading && (
          <button
            onClick={() => setShowEmptyTrash(true)}
            disabled={pending}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 h-9",
              "text-sm font-medium text-destructive border border-destructive/30",
              "hover:bg-destructive/10 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <Trash2 className="h-4 w-4" />
            Vaciar papelera
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <>
          {/* Bulk toolbar */}
          {canEdit && (
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

              <div className="flex items-center gap-2">
                {selected.size > 0 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleBulkRestore}
                      disabled={pending}
                      className="flex items-center gap-1.5 rounded-md px-2.5 h-7 text-xs font-medium text-foreground border border-border hover:bg-background transition-colors disabled:opacity-50"
                    >
                      <ArchiveRestore className="h-3 w-3" />
                      Restaurar
                    </button>
                    <button
                      onClick={() => setShowBulkDelete(true)}
                      disabled={pending}
                      className="flex items-center gap-1.5 rounded-md px-2.5 h-7 text-xs font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
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

                <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded transition-colors",
                      viewMode === "grid"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-label="Vista en cuadrícula"
                  >
                    <Grid3x3 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded transition-colors",
                      viewMode === "list"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-label="Vista en lista"
                  >
                    <List className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {viewMode === "grid" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
              {folders.map((folder) => (
                <TrashFolderCard
                  key={folder.id}
                  folder={folder}
                  disabled={pending}
                  canEdit={canEdit}
                  selected={selected.has(folder.id)}
                  onToggleSelect={() => toggleOne(folder.id)}
                  onRestore={() => restoreFolder(folder.id)}
                  onDelete={() => setFolderToDelete(folder)}
                />
              ))}
              {files?.map((file) => (
                <TrashFileCard
                  key={file.id}
                  file={file}
                  parentFolderName={
                    file.folder_id
                      ? trashedFolderNameById.get(file.folder_id) ?? null
                      : null
                  }
                  disabled={pending}
                  canEdit={canEdit}
                  selected={selected.has(file.id)}
                  onToggleSelect={() => toggleOne(file.id)}
                  onRestore={() => restoreFile(file.id)}
                  onDelete={() => setFileToDelete(file)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {folders.map((folder) => (
                <TrashFolderRow
                  key={folder.id}
                  folder={folder}
                  disabled={pending}
                  canEdit={canEdit}
                  selected={selected.has(folder.id)}
                  onToggleSelect={() => toggleOne(folder.id)}
                  onRestore={() => restoreFolder(folder.id)}
                  onDelete={() => setFolderToDelete(folder)}
                />
              ))}
              {files?.map((file) => (
                <TrashFileRow
                  key={file.id}
                  file={file}
                  parentFolderName={
                    file.folder_id
                      ? trashedFolderNameById.get(file.folder_id) ?? null
                      : null
                  }
                  disabled={pending}
                  canEdit={canEdit}
                  selected={selected.has(file.id)}
                  onToggleSelect={() => toggleOne(file.id)}
                  onRestore={() => restoreFile(file.id)}
                  onDelete={() => setFileToDelete(file)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!folderToDelete}
        onClose={() => setFolderToDelete(null)}
        onConfirm={() => {
          if (!folderToDelete) return;
          permanentDeleteFolder(folderToDelete.id, {
            onSuccess: () => setFolderToDelete(null),
          });
        }}
        title="Eliminar carpeta definitivamente"
        description={
          <>
            ¿Seguro que quieres eliminar la carpeta{" "}
            <span className="font-medium text-foreground">
              {folderToDelete?.name}
            </span>{" "}
            y todo su contenido de forma permanente? Esta acción no se puede
            deshacer y los archivos se borrarán del almacenamiento.
          </>
        }
        confirmLabel="Eliminar definitivamente"
        variant="destructive"
        isPending={deletingFolder}
        icon={<Trash2 className="h-5 w-5 text-destructive" />}
      />

      <ConfirmDialog
        open={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar definitivamente"
        description={
          <>
            ¿Seguro que quieres eliminar{" "}
            <span className="font-medium text-foreground">
              {fileToDelete?.name}
            </span>{" "}
            de forma permanente? Esta acción no se puede deshacer y el archivo
            se borrará del almacenamiento.
          </>
        }
        confirmLabel="Eliminar definitivamente"
        variant="destructive"
        isPending={deleting}
        icon={<Trash2 className="h-5 w-5 text-destructive" />}
      />

      <ConfirmDialog
        open={showBulkDelete}
        onClose={() => setShowBulkDelete(false)}
        onConfirm={confirmBulkDelete}
        title={`Eliminar ${selected.size} ${selected.size === 1 ? "elemento" : "elementos"}`}
        description={
          <>
            Los elementos seleccionados se borrarán de forma permanente y no
            podrán recuperarse.
          </>
        }
        confirmLabel="Eliminar definitivamente"
        variant="destructive"
        isPending={bulkPending}
        icon={<Trash2 className="h-5 w-5 text-destructive" />}
      />

      <ConfirmDialog
        open={showEmptyTrash}
        onClose={() => setShowEmptyTrash(false)}
        onConfirm={confirmEmptyTrash}
        title="Vaciar la papelera"
        description={
          <>
            Se borrarán de forma permanente{" "}
            <span className="font-medium text-foreground">
              {totalCount} {totalCount === 1 ? "elemento" : "elementos"}
            </span>
            . Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Vaciar papelera"
        variant="destructive"
        isPending={emptying}
        icon={<Trash2 className="h-5 w-5 text-destructive" />}
      />
    </div>
  );
}

// ============================================
// Folder row (list view)
// ============================================

interface TrashFolderRowProps {
  folder: FolderType;
  disabled: boolean;
  canEdit: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

function TrashFolderRow({
  folder,
  disabled,
  canEdit,
  selected,
  onToggleSelect,
  onRestore,
  onDelete,
}: TrashFolderRowProps) {
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
          aria-label={`Seleccionar ${folder.name}`}
        />
      )}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 opacity-70">
        <FolderIcon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate line-through decoration-muted-foreground/50">
          {folder.name}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Carpeta · Eliminada{" "}
          {format(new Date(folder.updated_at), "d MMM yyyy", { locale: es })}
        </p>
      </div>

      {canEdit && (
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={onRestore}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 h-8",
              "text-xs font-medium text-foreground border border-border",
              "hover:bg-muted transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <ArchiveRestore className="h-3.5 w-3.5" />
            Restaurar
          </button>
          <button
            onClick={onDelete}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 h-8",
              "text-xs font-medium text-destructive border border-destructive/30",
              "hover:bg-destructive/10 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// File row (list view)
// ============================================

interface TrashFileRowProps {
  file: FileRecord;
  parentFolderName: string | null;
  disabled: boolean;
  canEdit: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

function TrashFileRow({
  file,
  parentFolderName,
  disabled,
  canEdit,
  selected,
  onToggleSelect,
  onRestore,
  onDelete,
}: TrashFileRowProps) {
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
          aria-label={`Seleccionar ${file.name}`}
        />
      )}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg opacity-60",
          colorClass,
        )}
      >
        {renderFileTypeIcon(file.mime_type, "h-4 w-4")}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium text-foreground truncate line-through decoration-muted-foreground/50">
            {file.name}
          </p>
          {parentFolderName && (
            <span
              className={cn(
                "shrink-0 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5",
                "text-[10px] font-medium text-amber-600 bg-amber-500/10 border border-amber-500/20",
              )}
              title={`Se restaura junto con la carpeta "${parentFolderName}"`}
            >
              <FolderIcon className="h-2.5 w-2.5" />
              Dentro de {parentFolderName}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {formatFileSize(file.size)} · Eliminado{" "}
          {format(new Date(file.updated_at), "d MMM yyyy", { locale: es })}
        </p>
      </div>

      {canEdit && (
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={onRestore}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 h-8",
              "text-xs font-medium text-foreground border border-border",
              "hover:bg-muted transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <ArchiveRestore className="h-3.5 w-3.5" />
            Restaurar
          </button>
          <button
            onClick={onDelete}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 h-8",
              "text-xs font-medium text-destructive border border-destructive/30",
              "hover:bg-destructive/10 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Folder card (grid view)
// ============================================

function TrashFolderCard({
  folder,
  disabled,
  canEdit,
  selected,
  onToggleSelect,
  onRestore,
  onDelete,
}: TrashFolderRowProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border p-3 transition-colors",
        selected
          ? "bg-primary/5 border-primary/30"
          : "border-border hover:bg-muted/40",
      )}
    >
      {canEdit && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          disabled={disabled}
          className={cn(
            "absolute top-2 left-2 h-3.5 w-3.5 accent-primary z-10",
            selected ? "opacity-100" : "lg:opacity-0 lg:group-hover:opacity-100",
          )}
          aria-label={`Seleccionar ${folder.name}`}
        />
      )}
      <div className="flex h-20 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 opacity-70">
        <FolderIcon className="h-8 w-8" />
      </div>

      <div className="mt-2 min-w-0">
        <p className="text-sm font-medium text-foreground truncate line-through decoration-muted-foreground/50">
          {folder.name}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Carpeta · Eliminada{" "}
          {format(new Date(folder.updated_at), "d MMM yyyy", { locale: es })}
        </p>
      </div>

      {canEdit && (
        <div className="mt-2 flex items-center gap-1.5">
          <button
            onClick={onRestore}
            disabled={disabled}
            className="flex flex-1 items-center justify-center gap-1 rounded-md px-2 h-7 text-[11px] font-medium text-foreground border border-border hover:bg-background transition-colors disabled:opacity-50"
          >
            <ArchiveRestore className="h-3 w-3" />
            Restaurar
          </button>
          <button
            onClick={onDelete}
            disabled={disabled}
            className="flex items-center justify-center rounded-md h-7 w-7 text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors disabled:opacity-50"
            aria-label="Eliminar definitivamente"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// File card (grid view)
// ============================================

function TrashFileCard({
  file,
  parentFolderName,
  disabled,
  canEdit,
  selected,
  onToggleSelect,
  onRestore,
  onDelete,
}: TrashFileRowProps) {
  const colorClass = getFileColor(file.mime_type);
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border p-3 transition-colors",
        selected
          ? "bg-primary/5 border-primary/30"
          : "border-border hover:bg-muted/40",
      )}
    >
      {canEdit && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          disabled={disabled}
          className={cn(
            "absolute top-2 left-2 h-3.5 w-3.5 accent-primary z-10",
            selected ? "opacity-100" : "lg:opacity-0 lg:group-hover:opacity-100",
          )}
          aria-label={`Seleccionar ${file.name}`}
        />
      )}
      <div
        className={cn(
          "flex h-20 items-center justify-center rounded-lg opacity-60",
          colorClass,
        )}
      >
        {renderFileTypeIcon(file.mime_type, "h-8 w-8")}
      </div>

      <div className="mt-2 min-w-0">
        <p className="text-sm font-medium text-foreground truncate line-through decoration-muted-foreground/50">
          {file.name}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {formatFileSize(file.size)} · {format(new Date(file.updated_at), "d MMM yyyy", { locale: es })}
        </p>
        {parentFolderName && (
          <span
            className={cn(
              "mt-1 inline-flex max-w-full items-center gap-1 rounded-full px-1.5 py-0.5",
              "text-[10px] font-medium text-amber-600 bg-amber-500/10 border border-amber-500/20",
            )}
            title={`Se restaura junto con la carpeta "${parentFolderName}"`}
          >
            <FolderIcon className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">Dentro de {parentFolderName}</span>
          </span>
        )}
      </div>

      {canEdit && (
        <div className="mt-2 flex items-center gap-1.5">
          <button
            onClick={onRestore}
            disabled={disabled}
            className="flex flex-1 items-center justify-center gap-1 rounded-md px-2 h-7 text-[11px] font-medium text-foreground border border-border hover:bg-background transition-colors disabled:opacity-50"
          >
            <ArchiveRestore className="h-3 w-3" />
            Restaurar
          </button>
          <button
            onClick={onDelete}
            disabled={disabled}
            className="flex items-center justify-center rounded-md h-7 w-7 text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors disabled:opacity-50"
            aria-label="Eliminar definitivamente"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
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

function LoadingSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }
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
        <Trash2 className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        La papelera está vacía
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Los archivos que envíes a la papelera aparecerán aquí. Podrás
        restaurarlos o eliminarlos definitivamente.
      </p>
    </div>
  );
}
