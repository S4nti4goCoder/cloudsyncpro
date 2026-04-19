import { useState, useRef, useEffect } from 'react'
import {
  FolderUp,
  Folder as FolderIcon,
  FileIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { uploadService } from '@/services/uploadService'
import { folderService } from '@/services/folderService'
import { invalidateDashboardQueries } from '@/hooks/useDashboard'
import { supabase } from '@/lib/supabase'
import { formatFileSize } from '@/utils/fileUtils'
import {
  validateFile,
  validateFolderName,
  validateDepth,
  validateTotalSize,
  validateUploadBatchPerFolder,
} from '@/utils/uploadValidation'
import { cn } from '@/lib/utils'

interface UploadFolderModalProps {
  open: boolean
  onClose: () => void
  workspaceId: string
  folderId: string | null
}

interface FolderEntry {
  file: File
  relativePath: string
  dirPath: string
  fileName: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

function getDirPath(relativePath: string): string {
  const idx = relativePath.lastIndexOf('/')
  return idx === -1 ? '' : relativePath.slice(0, idx)
}

function getFileName(relativePath: string): string {
  const idx = relativePath.lastIndexOf('/')
  return idx === -1 ? relativePath : relativePath.slice(idx + 1)
}

export function UploadFolderModal({
  open,
  onClose,
  workspaceId,
  folderId,
}: UploadFolderModalProps) {
  const [entries, setEntries] = useState<FolderEntry[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [rootName, setRootName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!open) {
      setEntries([])
      setValidationError(null)
      setRootName(null)
      setIsUploading(false)
    }
  }, [open])

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setValidationError(null)

    const incoming: FolderEntry[] = []
    const rejections: string[] = []
    let detectedRoot: string | null = null

    for (const file of Array.from(fileList)) {
      // Browsers with webkitdirectory fill webkitRelativePath like "MyFolder/sub/file.pdf"
      const relativePath =
        (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
        file.name

      if (!detectedRoot) {
        detectedRoot = relativePath.split('/')[0] ?? null
      }

      const depthErr = validateDepth(relativePath)
      if (depthErr) {
        rejections.push(`${relativePath}: ${depthErr}`)
        continue
      }

      const fileErr = validateFile(file)
      if (fileErr) {
        rejections.push(fileErr)
        continue
      }

      const dirPath = getDirPath(relativePath)

      // Validate each folder name segment.
      const segments = dirPath.split('/').filter(Boolean)
      const badSegment = segments
        .map((s) => ({ s, err: validateFolderName(s) }))
        .find((x) => x.err)
      if (badSegment) {
        rejections.push(`Carpeta "${badSegment.s}": ${badSegment.err}`)
        continue
      }

      incoming.push({
        file,
        relativePath,
        dirPath,
        fileName: getFileName(relativePath),
        status: 'pending',
        progress: 0,
      })
    }

    // Per-folder batch limits — hard block: if any subfolder exceeds the
    // per-category limits, reject the whole selection.
    const byDir = new Map<string, { name: string }[]>()
    for (const e of incoming) {
      const list = byDir.get(e.dirPath) ?? []
      list.push({ name: e.fileName })
      byDir.set(e.dirPath, list)
    }
    for (const [dir, files] of byDir) {
      const batchErr = validateUploadBatchPerFolder(files)
      if (batchErr) {
        const dirLabel = dir === '' ? (detectedRoot ?? 'Carpeta raíz') : dir
        setEntries([])
        setRootName(null)
        setValidationError(`${dirLabel}: ${batchErr}`)
        if (inputRef.current) inputRef.current.value = ''
        return
      }
    }

    if (rejections.length) {
      toast.error(rejections[0] ?? 'Archivos rechazados', {
        description:
          rejections.length > 1 ? `y ${rejections.length - 1} más` : undefined,
      })
    }

    if (incoming.length) {
      setEntries(incoming)
      setRootName(detectedRoot)
    }

    if (inputRef.current) inputRef.current.value = ''
  }

  function openPicker() {
    inputRef.current?.click()
  }

  async function handleUpload() {
    if (!entries.length) return
    setValidationError(null)

    const pending = entries.filter((e) => e.status === 'pending')

    const sizeErr = validateTotalSize(pending.map((e) => e.file))
    if (sizeErr) {
      setValidationError(sizeErr)
      return
    }

    setIsUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Unique directory paths (relative) sorted by depth so parents exist first.
      const uniqueDirs = Array.from(new Set(pending.map((p) => p.dirPath)))
        .filter((d) => d.length > 0)
        .sort((a, b) => a.split('/').length - b.split('/').length)

      // Map relativeDirPath → created folder.id in DB.
      const dirToFolderId = new Map<string, string>()

      for (const dir of uniqueDirs) {
        const segments = dir.split('/')
        const lastSegment = segments[segments.length - 1]!
        const parentRelative = segments.slice(0, -1).join('/')
        const parentId =
          parentRelative === '' ? folderId : dirToFolderId.get(parentRelative) ?? null

        const created = await folderService.createFolder({
          name: lastSegment,
          workspaceId,
          parentId,
          createdBy: user.id,
        })
        dirToFolderId.set(dir, created.id)
      }

      // Upload files in sequence, with progress per entry.
      for (let i = 0; i < pending.length; i++) {
        const entry = pending[i]!
        const targetFolderId =
          entry.dirPath === ''
            ? folderId
            : dirToFolderId.get(entry.dirPath) ?? folderId

        const realIndex = entries.findIndex(
          (e) => e.file === entry.file && e.relativePath === entry.relativePath,
        )

        setEntries((prev) =>
          prev.map((e, idx) =>
            idx === realIndex ? { ...e, status: 'uploading' } : e,
          ),
        )

        try {
          await uploadService.uploadFile({
            file: entry.file,
            workspaceId,
            folderId: targetFolderId,
            onProgress: (progress) => {
              setEntries((prev) =>
                prev.map((e, idx) =>
                  idx === realIndex ? { ...e, progress } : e,
                ),
              )
            },
          })

          setEntries((prev) =>
            prev.map((e, idx) =>
              idx === realIndex
                ? { ...e, status: 'success', progress: 100 }
                : e,
            ),
          )
        } catch (error) {
          setEntries((prev) =>
            prev.map((e, idx) =>
              idx === realIndex
                ? {
                    ...e,
                    status: 'error',
                    error:
                      error instanceof Error ? error.message : 'Error al subir',
                  }
                : e,
            ),
          )
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['files', workspaceId] }),
        queryClient.invalidateQueries({ queryKey: ['folders', workspaceId] }),
      ])
      invalidateDashboardQueries(queryClient, workspaceId)

      setIsUploading(false)

      const successCount = entries.filter((e) => e.status === 'success').length
      if (successCount > 0) {
        toast.success(
          `Carpeta subida: ${successCount} archivo${successCount > 1 ? 's' : ''}`,
        )
      }
    } catch (error) {
      setIsUploading(false)
      setValidationError(
        error instanceof Error ? error.message : 'Error al subir la carpeta',
      )
    }
  }

  function handleClose() {
    if (isUploading) return
    onClose()
  }

  const pendingCount = entries.filter((e) => e.status === 'pending').length
  const successCount = entries.filter((e) => e.status === 'success').length
  const errorCount = entries.filter((e) => e.status === 'error').length
  const uniqueFolders = new Set(entries.map((e) => e.dirPath)).size

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <FolderUp className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-lg">Subir carpeta</DialogTitle>
          </div>
          <DialogDescription>
            Se preservará la estructura de carpetas y subcarpetas.
          </DialogDescription>
        </DialogHeader>

        {/* Hidden input with webkitdirectory */}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          // @ts-expect-error non-standard attributes for directory upload
          webkitdirectory="true"
          directory="true"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        {/* Dropzone-like area */}
        {entries.length === 0 && (
          <button
            type="button"
            onClick={openPicker}
            disabled={isUploading}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
              'border-border hover:border-primary/50 hover:bg-muted/50',
              'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <FolderUp className="h-8 w-8 mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Seleccionar carpeta
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Haz clic para explorar tu equipo
            </p>
          </button>
        )}

        {/* Summary header when there are entries */}
        {entries.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <FolderIcon className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {rootName ?? 'Carpeta'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {entries.length} archivo{entries.length > 1 ? 's' : ''} ·{' '}
                  {uniqueFolders} carpeta{uniqueFolders > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={() => {
                  setEntries([])
                  setRootName(null)
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* File list */}
        {entries.length > 0 && (
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {entries.map((entry, index) => (
              <div
                key={`${entry.relativePath}-${index}`}
                className="flex items-center gap-2 rounded-md border border-border p-2"
              >
                <FileIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate">
                    {entry.relativePath}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-muted-foreground">
                      {formatFileSize(entry.file.size)}
                    </p>
                    {entry.status === 'uploading' && (
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${entry.progress}%` }}
                        />
                      </div>
                    )}
                    {entry.status === 'error' && (
                      <p className="text-[10px] text-destructive truncate">
                        {entry.error}
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  {entry.status === 'uploading' && (
                    <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                  )}
                  {entry.status === 'success' && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  )}
                  {entry.status === 'error' && (
                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Validation error */}
        {validationError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{validationError}</p>
          </div>
        )}

        {/* Summary */}
        {(successCount > 0 || errorCount > 0) && !isUploading && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {successCount > 0 && (
              <span className="text-green-500">
                ✓ {successCount} completado{successCount > 1 ? 's' : ''}
              </span>
            )}
            {errorCount > 0 && (
              <span className="text-destructive">
                ✗ {errorCount} fallido{errorCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className={cn(
              'flex-1 h-10 rounded-lg border border-border text-sm font-medium',
              'text-muted-foreground hover:bg-muted transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {successCount > 0 && !isUploading ? 'Cerrar' : 'Cancelar'}
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || pendingCount === 0}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 h-10 rounded-lg',
              'bg-primary text-primary-foreground text-sm font-medium',
              'hover:bg-primary/90 transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isUploading
              ? 'Subiendo...'
              : `Subir ${pendingCount > 0 ? pendingCount : ''} archivo${
                  pendingCount !== 1 ? 's' : ''
                }`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
