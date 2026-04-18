import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  FileIcon,
  ImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileCodeIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/utils/fileUtils";
import { useUIStore } from "@/store/uiStore";
import type { FileRecord } from "@/types/authTypes";

interface FilePreviewModalProps {
  file: FileRecord | null;
  files?: FileRecord[];
  open: boolean;
  onClose: () => void;
  onFileChange?: (file: FileRecord) => void;
}

export function FilePreviewModal({
  file,
  files,
  open,
  onClose,
  onFileChange,
}: FilePreviewModalProps) {
  if (!open || !file) return null;
  return createPortal(
    <FilePreviewContent
      key={file.id}
      file={file}
      files={files}
      onClose={onClose}
      onFileChange={onFileChange}
    />,
    document.body,
  );
}

interface FilePreviewContentProps {
  file: FileRecord;
  files?: FileRecord[];
  onClose: () => void;
  onFileChange?: (file: FileRecord) => void;
}

function FilePreviewContent({
  file,
  files,
  onClose,
  onFileChange,
}: FilePreviewContentProps) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);

  const publicUrl = `${import.meta.env.VITE_R2_PUBLIC_URL}/${file.r2_key}`;
  const fileType = getFileType(file.mime_type, file.name);

  const navList = useMemo(() => files ?? [], [files]);
  const currentIndex = navList.findIndex((f) => f.id === file.id);
  const canPrev = !!onFileChange && currentIndex > 0;
  const canNext =
    !!onFileChange &&
    currentIndex >= 0 &&
    currentIndex < navList.length - 1;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && canPrev) {
        onFileChange!(navList[currentIndex - 1]);
      }
      if (e.key === "ArrowRight" && canNext) {
        onFileChange!(navList[currentIndex + 1]);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, canPrev, canNext, currentIndex, navList, onFileChange]);

  useEffect(() => {
    if (fileType !== "text") return;
    setIsLoading(true);
    setHasError(false);
    const controller = new AbortController();
    fetch(publicUrl, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        setTextContent(text);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setHasError(true);
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [fileType, publicUrl]);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div
      className={cn(
        "fixed top-16 right-0 bottom-0 z-40 flex flex-col bg-black/95 animate-fade-in",
        "left-0",
        sidebarCollapsed ? "lg:left-16" : "lg:left-64",
      )}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
            {getFileIcon(file.mime_type, file.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {file.name}
            </p>
            <p className="text-xs text-white/50">
              {formatFileSize(file.size)} · {file.mime_type}
              {navList.length > 1 && currentIndex >= 0 && (
                <>
                  {" · "}
                  <span className="tabular-nums">
                    {currentIndex + 1} / {navList.length}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {fileType === "image" && !hasError && (
            <>
              <button
                onClick={() => setImageZoom((z) => Math.max(0.25, z - 0.25))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Reducir zoom"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs text-white/50 w-12 text-center tabular-nums">
                {Math.round(imageZoom * 100)}%
              </span>
              <button
                onClick={() => setImageZoom((z) => Math.min(3, z + 0.25))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Aumentar zoom"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => setImageRotation((r) => (r + 90) % 360)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Rotar imagen"
              >
                <RotateCw className="h-4 w-4" />
              </button>
              <div className="w-px h-5 bg-white/10" />
            </>
          )}

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Abrir en nueva pestaña"
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          <a
            href={publicUrl}
            download={file.name}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Descargar archivo"
          >
            <Download className="h-4 w-4" />
          </a>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Cerrar previsualización"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      {canPrev && (
        <button
          onClick={() => onFileChange!(navList[currentIndex - 1])}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-2xl ring-1 ring-black/10 hover:bg-white hover:scale-105 transition-all"
          aria-label="Archivo anterior"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      )}
      {canNext && (
        <button
          onClick={() => onFileChange!(navList[currentIndex + 1])}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-2xl ring-1 ring-black/10 hover:bg-white hover:scale-105 transition-all"
          aria-label="Archivo siguiente"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      )}

      {/* Content */}
      <div className="relative overflow-auto flex items-center justify-center p-4 flex-1 min-h-0">
        {/* Loading overlay */}
        {isLoading && !hasError && fileType !== "other" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
            <Loader2 className="h-8 w-8 animate-spin text-white/60" />
            <p className="text-sm text-white/50">Cargando previsualización…</p>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 max-w-sm w-full text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
              <AlertCircle className="h-7 w-7 text-red-400" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium text-white">
                No se pudo cargar la previsualización
              </p>
              <p className="text-sm text-white/50">
                El archivo puede no estar disponible o tardar demasiado en
                responder.
              </p>
            </div>
            <a
              href={publicUrl}
              download={file.name}
              className="flex items-center gap-2 rounded-xl px-4 h-9 bg-white text-gray-900 text-sm font-medium hover:bg-white/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Descargar archivo
            </a>
          </div>
        )}

        {!hasError && fileType === "image" && (
          <div className="flex items-center justify-center w-full h-full">
            <img
              src={publicUrl}
              alt={file.name}
              onLoad={handleLoad}
              onError={handleError}
              className={cn(
                "max-w-full max-h-full object-contain transition-all duration-200 select-none",
                isLoading && "opacity-0",
              )}
              style={{
                transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
              }}
              draggable={false}
            />
          </div>
        )}

        {!hasError && fileType === "pdf" && (
          <iframe
            src={`${publicUrl}#toolbar=1&navpanes=0`}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "w-full h-full rounded-lg transition-opacity duration-200",
              isLoading && "opacity-0",
            )}
            title={file.name}
          />
        )}

        {!hasError && fileType === "video" && (
          <div className="w-full max-w-4xl flex items-center justify-center h-full">
            <video
              src={publicUrl}
              controls
              autoPlay={false}
              onLoadedData={handleLoad}
              onError={handleError}
              className={cn(
                "w-full max-h-full rounded-xl transition-opacity duration-200",
                isLoading && "opacity-0",
              )}
            >
              Tu navegador no soporta la reproducción de video.
            </video>
          </div>
        )}

        {!hasError && fileType === "audio" && (
          <div className="w-full max-w-lg">
            <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10">
                <FileAudioIcon className="h-12 w-12 text-orange-400" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-base font-medium text-white">{file.name}</p>
                <p className="text-sm text-white/50">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <audio
                src={publicUrl}
                controls
                autoPlay={false}
                onLoadedData={handleLoad}
                onError={handleError}
                className="w-full"
              >
                Tu navegador no soporta la reproducción de audio.
              </audio>
            </div>
          </div>
        )}

        {!hasError && fileType === "text" && textContent !== null && (
          <pre
            className={cn(
              "w-full h-full max-w-5xl overflow-auto p-6 rounded-lg bg-white/3 border border-white/10 text-white/90 text-sm font-mono whitespace-pre-wrap wrap-break-word",
              isLoading && "opacity-0",
            )}
          >
            {textContent}
          </pre>
        )}

        {fileType === "other" && (
          <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-white/5 border border-white/10 max-w-sm w-full text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
              <FileIcon className="h-10 w-10 text-white/60" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium text-white">{file.name}</p>
              <p className="text-sm text-white/50">
                {formatFileSize(file.size)}
              </p>
              <p className="text-xs text-white/30 mt-2">
                Este tipo de archivo no tiene previsualización disponible.
              </p>
            </div>

            <a
              href={publicUrl}
              download={file.name}
              className={cn(
                "flex items-center gap-2 rounded-xl px-6 h-10",
                "bg-white text-gray-900 text-sm font-medium",
                "hover:bg-white/90 transition-colors",
              )}
            >
              <Download className="h-4 w-4" />
              Descargar archivo
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

const TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "json",
  "csv",
  "tsv",
  "log",
  "js",
  "jsx",
  "ts",
  "tsx",
  "mjs",
  "cjs",
  "py",
  "rb",
  "go",
  "rs",
  "java",
  "kt",
  "c",
  "cc",
  "cpp",
  "h",
  "hpp",
  "cs",
  "php",
  "swift",
  "css",
  "scss",
  "sass",
  "less",
  "html",
  "htm",
  "xml",
  "svg",
  "yaml",
  "yml",
  "toml",
  "ini",
  "conf",
  "cfg",
  "env",
  "sh",
  "bash",
  "zsh",
  "ps1",
  "sql",
  "gitignore",
  "editorconfig",
  "dockerfile",
]);

function getFileType(
  mimeType: string,
  fileName: string,
): "image" | "pdf" | "video" | "audio" | "text" | "other" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("text/")) return "text";
  if (mimeType === "application/json" || mimeType === "application/xml") {
    return "text";
  }
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext && TEXT_EXTENSIONS.has(ext)) return "text";
  return "other";
}

function getFileIcon(mimeType: string, fileName: string) {
  const cls = "h-4 w-4";
  const type = getFileType(mimeType, fileName);
  if (type === "image")
    return <ImageIcon className={cn(cls, "text-purple-400")} />;
  if (type === "pdf")
    return <FileTextIcon className={cn(cls, "text-red-400")} />;
  if (type === "video")
    return <FileVideoIcon className={cn(cls, "text-pink-400")} />;
  if (type === "audio")
    return <FileAudioIcon className={cn(cls, "text-orange-400")} />;
  if (type === "text")
    return <FileCodeIcon className={cn(cls, "text-blue-400")} />;
  return <FileIcon className={cn(cls, "text-white/60")} />;
}
