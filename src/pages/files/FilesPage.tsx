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
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useWorkspaceStore, getActiveWorkspace } from "@/store/workspaceStore";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import {
  useFolders,
  useCreateFolder,
  useDeleteFolder,
  useRenameFolder,
} from "@/hooks/useFolders";
import { useFiles, useArchiveFile, useTrashFile } from "@/hooks/useFiles";
import { UploadFileModal } from "@/components/shared/UploadFileModal";
import { FilePreviewModal } from "@/components/shared/FilePreviewModal";
import { ShareFileModal } from "@/components/shared/ShareFileModal";
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
  const { mutate: archiveFile } = useArchiveFile(workspaceId, folderId);
  const { mutate: trashFile } = useTrashFile(workspaceId, folderId);

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
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Raíz</span>
        </button>
        {folderId && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">Carpeta actual</span>
          </>
        )}
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
                    onClick={() => handleFolderClick(folder)}
                    onDelete={() => deleteFolder(folder.id)}
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
                    onClick={() => setPreviewFile(file)}
                    onShare={() => setShareFile(file)}
                    onArchive={() => archiveFile(file.id)}
                    onTrash={() => trashFile(file.id)}
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
        open={previewFile !== null}
        onClose={() => setPreviewFile(null)}
      />

      <ShareFileModal
        file={shareFile}
        open={shareFile !== null}
        onClose={() => setShareFile(null)}
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
  onClick: () => void;
  onDelete: () => void;
}

function FolderCard({ folder, viewMode, onClick, onDelete }: FolderCardProps) {
  const { mutate: renameFolder } = useRenameFolder(folder.workspace_id);

  if (viewMode === "list") {
    return (
      <div
        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border"
        onClick={onClick}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
          <Folder className="h-4 w-4 text-blue-400" />
        </div>
        <span className="flex-1 text-sm font-medium text-foreground truncate">
          {folder.name}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {format(new Date(folder.created_at), "d MMM yyyy", { locale: es })}
        </span>
        <div onClick={(e) => e.stopPropagation()}>
          <FolderMenu
            onRename={() => {
              const name = prompt("Nuevo nombre:", folder.name);
              if (name && name !== folder.name)
                renameFolder({ id: folder.id, name });
            }}
            onDelete={onDelete}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative flex flex-col rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-150 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="h-1.5 w-full bg-linear-to-r from-blue-400 to-blue-500" />
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
                const name = prompt("Nuevo nombre:", folder.name);
                if (name && name !== folder.name)
                  renameFolder({ id: folder.id, name });
              }}
              onDelete={onDelete}
            />
          </div>
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground line-clamp-1 leading-tight">
            {folder.name}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {format(new Date(folder.created_at), "d MMM yyyy", { locale: es })}
          </p>
        </div>
      </div>
    </div>
  );
}

function FolderMenu({
  onRename,
  onDelete,
}: {
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={onRename}>
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Renombrar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Eliminar
        </DropdownMenuItem>
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
  onClick: () => void;
  onShare: () => void;
  onArchive: () => void;
  onTrash: () => void;
}

function FileCard({
  file,
  viewMode,
  onClick,
  onShare,
  onArchive,
  onTrash,
}: FileCardProps) {
  const colorClass = getFileColor(file.mime_type);

  if (viewMode === "list") {
    return (
      <div
        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer"
        onClick={onClick}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            colorClass,
          )}
        >
          {renderFileTypeIcon(file.mime_type, "h-4 w-4")}
        </div>
        <span className="flex-1 text-sm font-medium text-foreground truncate">
          {file.name}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatFileSize(file.size)}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {format(new Date(file.created_at), "d MMM yyyy", { locale: es })}
        </span>
        <div onClick={(e) => e.stopPropagation()}>
          <FileMenu onShare={onShare} onArchive={onArchive} onTrash={onTrash} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative flex flex-col rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-150 cursor-pointer overflow-hidden"
      onClick={onClick}
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
          <p className="text-sm font-medium text-foreground line-clamp-1 leading-tight flex-1">
            {file.name}
          </p>
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <FileMenu
              onShare={onShare}
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
  onShare,
  onArchive,
  onTrash,
}: {
  onShare: () => void;
  onArchive: () => void;
  onTrash: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={onShare}>
          <Share2 className="mr-2 h-3.5 w-3.5" />
          Compartir
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onArchive}>
          <Archive className="mr-2 h-3.5 w-3.5" />
          Archivar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onTrash}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Mover a papelera
        </DropdownMenuItem>
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
  onNewFolder,
  onUpload,
}: {
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
        Sube archivos o crea carpetas para organizar tu contenido.
      </p>
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
    </div>
  );
}
