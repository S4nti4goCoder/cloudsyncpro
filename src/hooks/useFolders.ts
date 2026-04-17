import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { folderService } from '@/services/folderService'
import { useAuthStore } from '@/store/authStore'

const FOLDERS_KEY = 'folders'

export function useFolders(workspaceId: string, parentId: string | null = null) {
  return useQuery({
    queryKey: [FOLDERS_KEY, workspaceId, parentId],
    queryFn: () => folderService.getFolders(workspaceId, parentId),
    enabled: !!workspaceId,
  })
}

export function useFolderPath(folderId: string | null) {
  return useQuery({
    queryKey: [FOLDERS_KEY, 'path', folderId],
    queryFn: () => folderService.getFolderPath(folderId!),
    enabled: !!folderId,
  })
}

export function useAllFolders(workspaceId: string) {
  return useQuery({
    queryKey: [FOLDERS_KEY, workspaceId, 'all'],
    queryFn: () => folderService.getAllFolders(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useCreateFolder(workspaceId: string, parentId: string | null = null) {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: (name: string) =>
      folderService.createFolder({
        name,
        workspaceId,
        parentId,
        createdBy: userId!,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [FOLDERS_KEY, workspaceId] })
      toast.success('Carpeta creada')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al crear la carpeta')
    },
  })
}

export function useRenameFolder(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      folderService.renameFolder(id, name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [FOLDERS_KEY, workspaceId] })
      toast.success('Carpeta renombrada')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al renombrar la carpeta')
    },
  })
}

export function useDeleteFolder(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => folderService.deleteFolder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [FOLDERS_KEY, workspaceId] })
      toast.success('Carpeta eliminada')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al eliminar la carpeta')
    },
  })
}