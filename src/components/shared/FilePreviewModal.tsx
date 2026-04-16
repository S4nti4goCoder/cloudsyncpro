import { useState, useEffect } from "react";
import {
  X,
  Download,
  FileIcon,
  ImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FileAudioIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/utils/fileUtils";
import type { FileRecord } from "@/types/authTypes";

interface FilePreviewModalProps {
  file: FileRecord | null;
  open: boolean;
  onClose: () => void;
}

export function FilePreviewModal({
  file,
  open,
  onClose,
}: FilePreviewModalProps) {
  if (!open || !file) return null;
  return <FilePreviewContent key={file.id} file={file} onClose={onClose} />;
}

interface FilePreviewContentProps {
  file: FileRecord;
  onClose: () => void;
}

function FilePreviewContent({ file, onClose }: FilePreviewContentProps) {
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const publicUrl = `${import.meta.env.VITE_R2_PUBLIC_URL}/${file.r2_key}`;
  const fileType = getFileType(file.mime_type);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
            {getFileIcon(file.mime_type)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {file.name}
            </p>
            <p className="text-xs text-white/50">
              {formatFileSize(file.size)} · {file.mime_type}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {fileType === "image" && (
            <>
              <button
                onClick={() => setImageZoom((z) => Math.max(0.25, z - 0.25))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Reducir zoom"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs text-white/50 w-12 text-center">
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

      {/* Content */}
      <div
        className="overflow-auto flex items-center justify-center p-4"
        style={{ height: "calc(100vh - 73px)" }}
      >
        {fileType === "image" && (
          <div className="flex items-center justify-center w-full h-full">
            <img
              src={publicUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
              style={{
                transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
              }}
              draggable={false}
            />
          </div>
        )}

        {fileType === "pdf" && (
          <iframe
            src={`${publicUrl}#toolbar=1&navpanes=0`}
            className="w-full rounded-lg"
            style={{ height: "calc(100vh - 73px)" }}
            title={file.name}
          />
        )}

        {fileType === "video" && (
          <div className="w-full max-w-4xl flex items-center justify-center h-full">
            <video
              src={publicUrl}
              controls
              autoPlay={false}
              className="w-full rounded-xl"
              style={{ maxHeight: "calc(100vh - 120px)" }}
            >
              Tu navegador no soporta la reproducción de video.
            </video>
          </div>
        )}

        {fileType === "audio" && (
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
                className="w-full"
              >
                Tu navegador no soporta la reproducción de audio.
              </audio>
            </div>
          </div>
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

function getFileType(
  mimeType: string,
): "image" | "pdf" | "video" | "audio" | "other" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "other";
}

function getFileIcon(mimeType: string) {
  const cls = "h-4 w-4";
  if (mimeType.startsWith("image/"))
    return <ImageIcon className={cn(cls, "text-purple-400")} />;
  if (mimeType === "application/pdf")
    return <FileTextIcon className={cn(cls, "text-red-400")} />;
  if (mimeType.startsWith("video/"))
    return <FileVideoIcon className={cn(cls, "text-pink-400")} />;
  if (mimeType.startsWith("audio/"))
    return <FileAudioIcon className={cn(cls, "text-orange-400")} />;
  return <FileIcon className={cn(cls, "text-white/60")} />;
}
