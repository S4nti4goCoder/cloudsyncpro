import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Folder,
  FileIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileArchiveIcon,
  ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useWorkspaceStore, getActiveWorkspace } from "@/store/workspaceStore";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useFavoriteResources, useToggleFavorite } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { formatFileSize, getFileColor } from "@/utils/fileUtils";
import { folderColorFromMetadata, getFolderColorClasses } from "@/utils/folderColors";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/Pagination";
import type { FileRecord, Folder as FolderType } from "@/types/authTypes";

const PAGE_SIZE = 6;

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  const activeWorkspace = getActiveWorkspace(workspaces ?? [], activeWorkspaceId);
  const workspaceId = activeWorkspace?.id ?? "";

  const { data, isLoading } = useFavoriteResources(workspaceId);
  const { mutate: toggleFavorite } = useToggleFavorite(workspaceId);

  const folders = data?.folders ?? [];
  const files = data?.files ?? [];
  const total = folders.length + files.length;
  const isEmpty = !isLoading && total === 0;

  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;
  const visibleFolders = folders.slice(startIdx, endIdx);
  const consumedByFolders = visibleFolders.length;
  const fileStart = Math.max(0, startIdx - folders.length);
  const fileEnd = fileStart + (PAGE_SIZE - consumedByFolders);
  const visibleFiles =
    startIdx + consumedByFolders >= folders.length
      ? files.slice(fileStart, fileEnd)
      : [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Favoritos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {activeWorkspace?.name ?? "Sin workspace"} · {total}{" "}
          {total === 1 ? "elemento" : "elementos"}
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <>
          {!!visibleFolders.length && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Carpetas
              </p>
              <div className="space-y-1">
                {visibleFolders.map((folder) => (
                  <FavoriteFolderRow
                    key={folder.id}
                    folder={folder}
                    onOpen={() => navigate(`/files?folder=${folder.id}`)}
                    onUnfavorite={() =>
                      toggleFavorite({
                        resourceType: "folder",
                        resourceId: folder.id,
                        isFavorite: true,
                      })
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {!!visibleFiles.length && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Archivos
              </p>
              <div className="space-y-1">
                {visibleFiles.map((file) => (
                  <FavoriteFileRow
                    key={file.id}
                    file={file}
                    onOpen={() =>
                      navigate(
                        file.folder_id
                          ? `/files?folder=${file.folder_id}`
                          : `/files`,
                      )
                    }
                    onUnfavorite={() =>
                      toggleFavorite({
                        resourceType: "file",
                        resourceId: file.id,
                        isFavorite: true,
                      })
                    }
                  />
                ))}
              </div>
            </div>
          )}

          <Pagination
            page={safePage}
            pageCount={pageCount}
            onPageChange={(p) => {
              setPage(p);
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          />
        </>
      )}
    </div>
  );
}

function FavoriteFolderRow({
  folder,
  onOpen,
  onUnfavorite,
}: {
  folder: FolderType;
  onOpen: () => void;
  onUnfavorite: () => void;
}) {
  const color = folderColorFromMetadata(folder.metadata);
  const colorClasses = getFolderColorClasses(color);

  return (
    <div
      onClick={onOpen}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer border",
        "border-transparent hover:bg-muted/50 hover:border-border transition-colors",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          colorClasses.iconBg,
        )}
      >
        <Folder className={cn("h-4 w-4", colorClasses.iconFg)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{folder.name}</p>
        <p className="text-[11px] text-muted-foreground">
          Creada {format(new Date(folder.created_at), "d MMM yyyy", { locale: es })}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUnfavorite();
        }}
        className="flex h-7 w-7 items-center justify-center rounded-md text-amber-400 hover:bg-muted transition-colors"
        aria-label="Quitar de favoritos"
      >
        <Star className="h-3.5 w-3.5 fill-amber-400" />
      </button>
    </div>
  );
}

function FavoriteFileRow({
  file,
  onOpen,
  onUnfavorite,
}: {
  file: FileRecord;
  onOpen: () => void;
  onUnfavorite: () => void;
}) {
  const colorClass = getFileColor(file.mime_type);

  return (
    <div
      onClick={onOpen}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer border",
        "border-transparent hover:bg-muted/50 hover:border-border transition-colors",
      )}
    >
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colorClass)}>
        {renderFileTypeIcon(file.mime_type, "h-4 w-4")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {formatFileSize(file.size)} ·{" "}
          {format(new Date(file.created_at), "d MMM yyyy", { locale: es })}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUnfavorite();
        }}
        className="flex h-7 w-7 items-center justify-center rounded-md text-amber-400 hover:bg-muted transition-colors"
        aria-label="Quitar de favoritos"
      >
        <Star className="h-3.5 w-3.5 fill-amber-400" />
      </button>
    </div>
  );
}

function renderFileTypeIcon(mimeType: string, className: string) {
  if (mimeType.startsWith("image/")) return <ImageIcon className={className} />;
  if (mimeType.startsWith("video/")) return <FileVideoIcon className={className} />;
  if (mimeType.startsWith("audio/")) return <FileAudioIcon className={className} />;
  if (mimeType === "application/pdf") return <FileTextIcon className={className} />;
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
        <Star className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        No tienes favoritos todavía
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Marca archivos o carpetas con la estrella para encontrarlos aquí rápidamente.
      </p>
    </div>
  );
}
