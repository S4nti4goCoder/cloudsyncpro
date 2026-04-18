import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fileService } from '@/services/fileService'

const FILES_KEY = 'files'

export function useFiles(workspaceId: string, folderId: string | null = null) {
  return useQuery({
    queryKey: [FILES_KEY, workspaceId, folderId],
    queryFn: () => fileService.getFiles(workspaceId, folderId),
    enabled: !!workspaceId,
  })
}

export function useArchivedFiles(workspaceId: string) {
  return useQuery({
    queryKey: [FILES_KEY, workspaceId, 'archived'],
    queryFn: () => fileService.getArchivedFiles(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useDeletedFiles(workspaceId: string) {
  return useQuery({
    queryKey: [FILES_KEY, workspaceId, 'deleted'],
    queryFn: () => fileService.getDeletedFiles(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useRenameFile(workspaceId: string, folderId: string | null = null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      fileService.renameFile(id, name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [FILES_KEY, workspaceId, folderId] })
      toast.success('Archivo renombrado')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al renombrar el archivo')
    },
  })
}

export function useArchiveFile(workspaceId: string, folderId: string | null = null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fileService.archiveFile(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [FILES_KEY, workspaceId, folderId] })
      toast.success('Archivo archivado')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al archivar el archivo')
    },
  })
}

export function useTrashFile(workspaceId: string, folderId: string | null = null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fileService.trashFile(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [FILES_KEY, workspaceId, folderId] })
      toast.success('Archivo movido a la papelera')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al mover a la papelera')
    },
  })
}

export function useRestoreFile(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fileService.restoreFile(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [FILES_KEY, workspaceId] })
      toast.success('Archivo restaurado')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al restaurar el archivo')
    },
  })
}

export function useMoveFile(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, targetFolderId }: { id: string; targetFolderId: string | null }) =>
      fileService.moveFile(id, targetFolderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [FILES_KEY, workspaceId] })
      toast.success('Archivo movido')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al mover el archivo')
    },
  })
}

export function useDeleteFile(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fileService.deleteFile(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [FILES_KEY, workspaceId] })
      toast.success('Archivo eliminado permanentemente')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al eliminar el archivo')
    },
  })
}

export function useBulkRestoreFiles(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => fileService.bulkRestore(ids),
    onSuccess: (_, ids) => {
      void queryClient.invalidateQueries({ queryKey: [FILES_KEY, workspaceId] })
      toast.success(`${ids.length} ${ids.length === 1 ? 'archivo restaurado' : 'archivos restaurados'}`)
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al restaurar los archivos')
    },
  })
}

export function useBulkDeleteFiles(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => fileService.bulkDelete(ids),
    onSuccess: (_, ids) => {
      void queryClient.invalidateQueries({ queryKey: [FILES_KEY, workspaceId] })
      toast.success(`${ids.length} ${ids.length === 1 ? 'archivo eliminado' : 'archivos eliminados'}`)
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al eliminar los archivos')
    },
  })
}

export function useEmptyTrash(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => fileService.emptyTrash(workspaceId),
    onSuccess: (count) => {
      void queryClient.invalidateQueries({ queryKey: [FILES_KEY, workspaceId] })
      if (count > 0) {
        toast.success(`Papelera vaciada (${count} ${count === 1 ? 'archivo' : 'archivos'})`)
      } else {
        toast.info('La papelera ya estaba vacía')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al vaciar la papelera')
    },
  })
}