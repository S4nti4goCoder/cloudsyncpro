import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
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
import { fileService } from '@/services/fileService'
import { formatFileSize } from '@/utils/fileUtils'
import {
  validateFile,
  validateStorageCapacity,
  validateTotalSize,
} from '@/utils/uploadValidation'
import { cn } from '@/lib/utils'

interface UploadFileModalProps {
  open: boolean
  onClose: () => void
  workspaceId: string
  folderId: string | null
  initialFiles?: File[]
}

interface FileUploadState {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export function UploadFileModal({
  open,
  onClose,
  workspaceId,
  folderId,
  initialFiles,
}: UploadFileModalProps) {
  const [files, setFiles] = useState<FileUploadState[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  function addFiles(incoming: File[]) {
    const accepted: FileUploadState[] = []
    const rejectionMessages: string[] = []
    for (const file of incoming) {
      const err = validateFile(file)
      if (err) {
        rejectionMessages.push(err)
        continue
      }
      accepted.push({ file, progress: 0, status: 'pending' as const })
    }
    if (rejectionMessages.length) {
      toast.error(rejectionMessages[0] ?? 'Archivo rechazado', {
        description:
          rejectionMessages.length > 1
            ? `y ${rejectionMessages.length - 1} más`
            : undefined,
      })
    }
    if (accepted.length) {
      setFiles((prev) => [...prev, ...accepted])
    }
  }

  useEffect(() => {
    if (open && initialFiles?.length) {
      setFiles([])
      addFiles(initialFiles)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialFiles])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    addFiles(acceptedFiles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
  })

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleUpload() {
    if (!files.length) return
    setValidationError(null)

    const pendingFiles = files.filter((f) => f.status === 'pending')

    const sizeErr = validateTotalSize(pendingFiles.map((f) => f.file))
    if (sizeErr) {
      setValidationError(sizeErr)
      return
    }

    try {
      const capacity = await fileService.getFolderCapacity(workspaceId, folderId)
      const capErr = validateStorageCapacity(
        pendingFiles.map((f) => ({ name: f.file.name })),
        capacity,
      )
      if (capErr) {
        setValidationError(capErr)
        return
      }
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : 'No se pudo validar la carpeta',
      )
      return
    }

    setIsUploading(true)

    for (let i = 0; i < pendingFiles.length; i++) {
      const fileState = pendingFiles[i]
      if (!fileState) continue

      const fileIndex = files.findIndex((f) => f.file === fileState.file)

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === fileIndex ? { ...f, status: 'uploading' } : f
        )
      )

      try {
        await uploadService.uploadFile({
          file: fileState.file,
          workspaceId,
          folderId,
          onProgress: (progress) => {
            setFiles((prev) =>
              prev.map((f, idx) =>
                idx === fileIndex ? { ...f, progress } : f
              )
            )
          },
        })

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === fileIndex ? { ...f, status: 'success', progress: 100 } : f
          )
        )
      } catch (error) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === fileIndex
              ? {
                  ...f,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Error al subir',
                }
              : f
          )
        )
      }
    }

    await queryClient.invalidateQueries({ queryKey: ['files', workspaceId, folderId] })
    setIsUploading(false)

    const successCount = files.filter((f) => f.status === 'success').length
    if (successCount > 0) {
      toast.success(`${successCount} archivo${successCount > 1 ? 's' : ''} subido${successCount > 1 ? 's' : ''} correctamente`)
    }
  }

  function handleClose() {
    if (isUploading) return
    setFiles([])
    setValidationError(null)
    onClose()
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length
  const successCount = files.filter((f) => f.status === 'success').length
  const errorCount = files.filter((f) => f.status === 'error').length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-lg">Subir archivos</DialogTitle>
          </div>
          <DialogDescription>
            Arrastra archivos o haz clic para seleccionarlos.
          </DialogDescription>
        </DialogHeader>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50',
            isUploading && 'cursor-not-allowed opacity-50'
          )}
        >
          <input {...getInputProps()} />
          <Upload className={cn(
            'h-8 w-8 mb-3 transition-colors',
            isDragActive ? 'text-primary' : 'text-muted-foreground'
          )} />
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            o haz clic para explorar
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((fileState, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs font-medium text-foreground truncate">
                    {fileState.file.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-muted-foreground">
                      {formatFileSize(fileState.file.size)}
                    </p>
                    {fileState.status === 'uploading' && (
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${fileState.progress}%` }}
                        />
                      </div>
                    )}
                    {fileState.status === 'error' && (
                      <p className="text-[10px] text-destructive truncate">
                        {fileState.error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {fileState.status === 'pending' && (
                    <button
                      onClick={() => removeFile(index)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {fileState.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  )}
                  {fileState.status === 'success' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {fileState.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
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
              <span className="text-green-500">✓ {successCount} completado{successCount > 1 ? 's' : ''}</span>
            )}
            {errorCount > 0 && (
              <span className="text-destructive">✗ {errorCount} fallido{errorCount > 1 ? 's' : ''}</span>
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
              'disabled:cursor-not-allowed disabled:opacity-50'
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
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isUploading
              ? 'Subiendo...'
              : `Subir ${pendingCount > 0 ? pendingCount : ''} archivo${pendingCount !== 1 ? 's' : ''}`
            }
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}