import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FolderPlus,
  Upload,
  Grid3x3,
  List,
  Folder,
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  FolderInput,
  ChevronRight,
  Home,
  FileIcon,
  ImageIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileArchiveIcon,
  Share2,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useWorkspaceStore, getActiveWorkspace } from "@/store/workspaceStore";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import {
  useFolders,
  useFolderPath,
  useCreateFolder,
  useDeleteFolder,
  useRenameFolder,
} from "@/hooks/useFolders";
import { useFiles, useArchiveFile, useTrashFile, useRenameFile, useMoveFile } from "@/hooks/useFiles";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";
import { UploadFileModal } from "@/components/shared/UploadFileModal";
import { FilePreviewModal } from "@/components/shared/FilePreviewModal";
import { ShareFileModal } from "@/components/shared/ShareFileModal";
import { MoveFileModal } from "@/components/shared/MoveFileModal";
import { ResourceActivityModal } from "@/components/shared/ResourceActivityModal";
import { cn } from "@/lib/utils";
import { formatFileSize, getFileColor } from "@/utils/fileUtils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Folder as FolderType, FileRecord } from "@/types/authTypes";

type ViewMode = "grid" | "list";

export default function FilesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [shareFile, setShareFile] = useState<FileRecord | null>(null);
  const [moveFile, setMoveFile] = useState<FileRecord | null>(null);
  const [activityResource, setActivityResource] = useState<{
    id: string;
    name: string;
    type: "file" | "folder";
  } | null>(null);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [draggingFileId, setDraggingFileId] = useState<string | null>(null);

  const folderId = searchParams.get("folder");
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  const activeWorkspace = getActiveWorkspace(
    workspaces ?? [],
    activeWorkspaceId,
  );
  const workspaceId = activeWorkspace?.id ?? "";

  const { data: folders, isLoading: foldersLoading } = useFolders(
    workspaceId,
    folderId,
  );
  const { data: files, isLoading: filesLoading } = useFiles(
    workspaceId,
    folderId,
  );
  const { mutate: createFolder, isPending: creatingFolder } = useCreateFolder(
    workspaceId,
    folderId,
  );
  const { mutate: deleteFolder } = useDeleteFolder(workspaceId);
  const { data: folderPath } = useFolderPath(folderId);
  const { mutate: archiveFile } = useArchiveFile(workspaceId, folderId);
  const { mutate: trashFile } = useTrashFile(workspaceId, folderId);
  const { mutate: renameFile } = useRenameFile(workspaceId, folderId);
  const { mutate: doMoveFile, isPending: movePending } = useMoveFile(workspaceId);
  const { canEdit, isViewer } = useWorkspaceRole();

  const isLoading = foldersLoading || filesLoading;
  const isEmpty = !isLoading && !folders?.length && !files?.length;

  function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim(), {
      onSuccess: () => {
        setNewFolderName("");
        setShowNewFolder(false);
      },
    });
  }

  function handleFolderClick(folder: FolderType) {
    setSearchParams({ folder: folder.id });
  }

  function handleGoBack() {
    setSearchParams({});
  }

  function handleDragStart(fileId: string) {
    setDraggingFileId(fileId);
  }

  function handleDragEnd() {
    setDraggingFileId(null);
    setDragOverFolderId(null);
  }

  function handleDropOnFolder(targetFolderId: string | null) {
    if (!draggingFileId) return;
    doMoveFile({ id: draggingFileId, targetFolderId });
    setDraggingFileId(null);
    setDragOverFolderId(null);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Mis archivos
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeWorkspace?.name ?? "Sin workspace"}
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewFolder(true)}
              className={cn(
                "flex items-center gap-2 rounded-lg border border-border px-3 h-9",
                "text-sm font-medium text-foreground",
                "hover:bg-muted transition-colors",
              )}
            >
              <FolderPlus className="h-4 w-4" />
              Nueva carpeta
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className={cn(
                "flex items-center gap-2 rounded-lg bg-primary px-3 h-9",
                "text-sm font-medium text-primary-foreground",
                "hover:bg-primary/90 transition-colors",
              )}
            >
              <Upload className="h-4 w-4" />
              Subir archivo
            </button>
          </div>
        )}
        {isViewer && (
          <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
            Modo solo lectura
          </span>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <button
          onClick={handleGoBack}
          onDragOver={(e) => { if (canEdit && folderId && draggingFileId) { e.preventDefault(); setDragOverFolderId("root"); } }}
          onDragLeave={() => setDragOverFolderId(null)}
          onDrop={(e) => { e.preventDefault(); if (canEdit && folderId) handleDropOnFolder(null); }}
          className={cn(
            "flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors",
            dragOverFolderId === "root" && "text-primary font-medium ring-2 ring-primary/30 rounded-md px-1.5 -mx-1.5",
          )}
        >
          <Home className="h-3.5 w-3.5" />
          <span>Raíz</span>
        </button>
        {folderPath?.map((f) => (
          <div key={f.id} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <button
              onClick={() => setSearchParams({ folder: f.id })}
              className={cn(
                "transition-colors",
                f.id === folderId
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.name}
            </button>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {!isLoading && (
            <>{(folders?.length ?? 0) + (files?.length ?? 0)} elementos</>
          )}
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-label="Vista en cuadrícula"
          >
            <Grid3x3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              viewMode === "list"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-label="Vista en lista"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* New folder input */}
      {showNewFolder && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-primary/30 bg-primary/5 animate-fade-in">
          <Folder className="h-5 w-5 text-primary shrink-0" />
          <input
            type="text"
            placeholder="Nombre de la carpeta"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
              if (e.key === "Escape") {
                setShowNewFolder(false);
                setNewFolderName("");
              }
            }}
            autoFocus
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setShowNewFolder(false);
                setNewFolderName("");
              }}
              className="rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || creatingFolder}
              className="rounded-md bg-primary px-2.5 py-1 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Crear
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : isEmpty ? (
        <EmptyState
          canEdit={canEdit}
          onNewFolder={() => setShowNewFolder(true)}
          onUpload={() => setShowUploadModal(true)}
        />
      ) : (
        <>
          {/* Folders */}
          {!!folders?.length && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Carpetas
              </p>
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
                    : "space-y-1",
                )}
              >
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    viewMode={viewMode}
                    canEdit={canEdit}
                    onClick={() => handleFolderClick(folder)}
                    onDelete={() => deleteFolder(folder.id)}
                    onActivity={() => setActivityResource({ id: folder.id, name: folder.name, type: "folder" })}
                    isRenaming={renamingFolderId === folder.id}
                    onStartRename={() => setRenamingFolderId(folder.id)}
                    onCancelRename={() => setRenamingFolderId(null)}
                    isDragOver={dragOverFolderId === folder.id}
                    onDragOver={() => setDragOverFolderId(folder.id)}
                    onDragLeave={() => setDragOverFolderId(null)}
                    onDrop={() => handleDropOnFolder(folder.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {!!files?.length && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Archivos
              </p>
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
                    : "space-y-1",
                )}
              >
                {files.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    viewMode={viewMode}
                    canEdit={canEdit}
                    onClick={() => setPreviewFile(file)}
                    onShare={() => setShareFile(file)}
                    onArchive={() => archiveFile(file.id)}
                    onTrash={() => trashFile(file.id)}
                    onMove={() => setMoveFile(file)}
                    onActivity={() => setActivityResource({ id: file.id, name: file.name, type: "file" })}
                    isRenaming={renamingFileId === file.id}
                    onStartRename={() => setRenamingFileId(file.id)}
                    onRename={(name) => {
                      renameFile({ id: file.id, name });
                      setRenamingFileId(null);
                    }}
                    onCancelRename={() => setRenamingFileId(null)}
                    onDragStart={() => handleDragStart(file.id)}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <UploadFileModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        workspaceId={workspaceId}
        folderId={folderId}
      />

      <FilePreviewModal
        file={previewFile}
        files={files}
        open={previewFile !== null}
        onClose={() => setPreviewFile(null)}
        onFileChange={setPreviewFile}
      />

      <ShareFileModal
        file={shareFile}
        open={shareFile !== null}
        onClose={() => setShareFile(null)}
      />

      <MoveFileModal
        file={moveFile}
        open={moveFile !== null}
        onClose={() => setMoveFile(null)}
        onMove={(fileId, targetFolderId) => {
          doMoveFile({ id: fileId, targetFolderId }, {
            onSuccess: () => setMoveFile(null),
          });
        }}
        isPending={movePending}
      />

      <ResourceActivityModal
        resourceId={activityResource?.id ?? null}
        resourceName={activityResource?.name ?? ""}
        resourceType={activityResource?.type ?? "file"}
        workspaceId={workspaceId}
        open={activityResource !== null}
        onClose={() => setActivityResource(null)}
      />
    </div>
  );
}

// ============================================
// FolderCard
// ============================================

interface FolderCardProps {
  folder: FolderType;
  viewMode: ViewMode;
  canEdit: boolean;
  onClick: () => void;
  onDelete: () => void;
  onActivity: () => void;
  isRenaming: boolean;
  onStartRename: () => void;
  onCancelRename: () => void;
  isDragOver: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
}

function FolderCard({ folder, viewMode, canEdit, onClick, onDelete, onActivity, isRenaming, onStartRename, onCancelRename, isDragOver, onDragOver, onDragLeave, onDrop }: FolderCardProps) {
  const { mutate: renameFolder } = useRenameFolder(folder.workspace_id);
  const [editName, setEditName] = useState(folder.name);

  function handleRenameConfirm() {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== folder.name) {
      renameFolder({ id: folder.id, name: trimmed });
    }
    onCancelRename();
  }

  const nameElement = isRenaming ? (
    <input
      type="text"
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleRenameConfirm();
        if (e.key === "Escape") onCancelRename();
      }}
      onBlur={handleRenameConfirm}
      onClick={(e) => e.stopPropagation()}
      autoFocus
      className="w-full bg-transparent text-sm font-medium text-foreground border-b border-primary focus:outline-none"
    />
  ) : (
    <p className="text-sm font-medium text-foreground line-clamp-1 leading-tight">
      {folder.name}
    </p>
  );

  const dropHandlers = canEdit
    ? {
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); onDragOver(); },
        onDragLeave: (e: React.DragEvent) => { e.stopPropagation(); onDragLeave(); },
        onDrop: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); onDrop(); },
      }
    : {};

  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-all cursor-pointer border",
          isDragOver ? "border-primary bg-primary/5 shadow-sm" : "border-transparent hover:border-border",
        )}
        onClick={isRenaming ? undefined : onClick}
        {...dropHandlers}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
          <Folder className="h-4 w-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">{nameElement}</div>
        <span className="text-xs text-muted-foreground shrink-0">
          {format(new Date(folder.created_at), "d MMM yyyy", { locale: es })}
        </span>
        <div onClick={(e) => e.stopPropagation()}>
          <FolderMenu
            canEdit={canEdit}
            onRename={() => {
              setEditName(folder.name);
              onStartRename();
            }}
            onActivity={onActivity}
            onDelete={onDelete}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card hover:shadow-sm transition-all duration-150 cursor-pointer overflow-hidden",
        isDragOver ? "border-primary bg-primary/5 shadow-md scale-[1.02]" : "border-border hover:border-primary/30",
      )}
      onClick={isRenaming ? undefined : onClick}
      {...dropHandlers}
    >
      <div className={cn("h-1.5 w-full bg-linear-to-r", isDragOver ? "from-primary to-primary/70" : "from-blue-400 to-blue-500")} />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <Folder className="h-5 w-5 text-blue-400" />
          </div>
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <FolderMenu
              onRename={() => {
                setEditName(folder.name);
                onStartRename();
              }}
              onActivity={onActivity}
              onDelete={onDelete}
            />
          </div>
        </div>
        <div className="space-y-0.5">
          {nameElement}
          <p className="text-[11px] text-muted-foreground">
            {format(new Date(folder.created_at), "d MMM yyyy", { locale: es })}
          </p>
        </div>
      </div>
    </div>
  );
}

function FolderMenu({
  canEdit,
  onRename,
  onActivity,
  onDelete,
}: {
  canEdit: boolean;
  onRename: () => void;
  onActivity: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {canEdit && (
          <DropdownMenuItem onSelect={onRename}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Renombrar
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={onActivity}>
          <Activity className="mr-2 h-3.5 w-3.5" />
          Ver actividad
        </DropdownMenuItem>
        {canEdit && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Eliminar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================
// FileCard
// ============================================

interface FileCardProps {
  file: FileRecord;
  viewMode: ViewMode;
  canEdit: boolean;
  onClick: () => void;
  onShare: () => void;
  onArchive: () => void;
  onTrash: () => void;
  onMove: () => void;
  onActivity: () => void;
  isRenaming: boolean;
  onStartRename: () => void;
  onRename: (name: string) => void;
  onCancelRename: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function FileCard({
  file,
  viewMode,
  canEdit,
  onClick,
  onShare,
  onArchive,
  onTrash,
  onMove,
  onActivity,
  isRenaming,
  onStartRename,
  onRename,
  onCancelRename,
  onDragStart,
  onDragEnd,
}: FileCardProps) {
  const colorClass = getFileColor(file.mime_type);
  const [editName, setEditName] = useState(file.name);

  function handleRenameConfirm() {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== file.name) {
      onRename(trimmed);
    } else {
      onCancelRename();
    }
  }

  const nameElement = isRenaming ? (
    <input
      type="text"
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleRenameConfirm();
        if (e.key === "Escape") onCancelRename();
      }}
      onBlur={handleRenameConfirm}
      onClick={(e) => e.stopPropagation()}
      autoFocus
      className="w-full bg-transparent text-sm font-medium text-foreground border-b border-primary focus:outline-none"
    />
  ) : (
    <p className="text-sm font-medium text-foreground line-clamp-1 leading-tight flex-1">
      {file.name}
    </p>
  );

  const dragProps = {
    draggable: canEdit && !isRenaming,
    onDragStart: (e: React.DragEvent) => { e.dataTransfer.effectAllowed = "move"; onDragStart(); },
    onDragEnd,
  };

  if (viewMode === "list") {
    return (
      <div
        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer"
        {...dragProps}
        onClick={isRenaming ? undefined : onClick}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            colorClass,
          )}
        >
          {renderFileTypeIcon(file.mime_type, "h-4 w-4")}
        </div>
        <div className="flex-1 min-w-0">{nameElement}</div>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatFileSize(file.size)}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {format(new Date(file.created_at), "d MMM yyyy", { locale: es })}
        </span>
        <div onClick={(e) => e.stopPropagation()}>
          <FileMenu
            canEdit={canEdit}
            onRename={() => { setEditName(file.name); onStartRename(); }}
            onShare={onShare}
            onMove={onMove}
            onActivity={onActivity}
            onArchive={onArchive}
            onTrash={onTrash}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative flex flex-col rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-150 cursor-pointer overflow-hidden"
      onClick={isRenaming ? undefined : onClick}
      {...dragProps}
    >
      <div
        className={cn(
          "flex h-24 w-full items-center justify-center",
          colorClass.split(" ")[1],
        )}
      >
        {renderFileTypeIcon(
          file.mime_type,
          cn("h-10 w-10", colorClass.split(" ")[0]),
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-1">
          {nameElement}
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <FileMenu
              onRename={() => { setEditName(file.name); onStartRename(); }}
              onShare={onShare}
              onMove={onMove}
              onActivity={onActivity}
              onArchive={onArchive}
              onTrash={onTrash}
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {formatFileSize(file.size)} ·{" "}
          {format(new Date(file.created_at), "d MMM yyyy", { locale: es })}
        </p>
      </div>
    </div>
  );
}

function FileMenu({
  canEdit,
  onRename,
  onShare,
  onMove,
  onActivity,
  onArchive,
  onTrash,
}: {
  canEdit: boolean;
  onRename: () => void;
  onShare: () => void;
  onMove: () => void;
  onActivity: () => void;
  onArchive: () => void;
  onTrash: () => void;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {canEdit && (
          <>
            <DropdownMenuItem onSelect={onRename}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Renombrar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onShare}>
              <Share2 className="mr-2 h-3.5 w-3.5" />
              Compartir
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onMove}>
              <FolderInput className="mr-2 h-3.5 w-3.5" />
              Mover a…
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onSelect={onActivity}>
          <Activity className="mr-2 h-3.5 w-3.5" />
          Ver actividad
        </DropdownMenuItem>
        {canEdit && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onArchive}>
              <Archive className="mr-2 h-3.5 w-3.5" />
              Archivar
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={onTrash}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Mover a papelera
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================
// Helpers
// ============================================

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
  return (
    <div
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
          : "space-y-2",
      )}
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton
          key={i}
          className={
            viewMode === "grid" ? "h-32 rounded-xl" : "h-10 rounded-lg"
          }
        />
      ))}
    </div>
  );
}

function EmptyState({
  canEdit,
  onNewFolder,
  onUpload,
}: {
  canEdit: boolean;
  onNewFolder: () => void;
  onUpload: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
        <Folder className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        Esta carpeta está vacía
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {canEdit
          ? "Sube archivos o crea carpetas para organizar tu contenido."
          : "No tienes permisos para subir archivos en este workspace."}
      </p>
      {canEdit && (
        <div className="flex items-center gap-2">
          <button
            onClick={onNewFolder}
            className="flex items-center gap-2 rounded-lg border border-border px-4 h-9 text-sm font-medium hover:bg-muted transition-colors"
          >
            <FolderPlus className="h-4 w-4" />
            Nueva carpeta
          </button>
          <button
            onClick={onUpload}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 h-9 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Subir archivo
          </button>
        </div>
      )}
    </div>
  );
}
