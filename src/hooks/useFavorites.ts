import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { favoriteService } from '@/services/favoriteService'
import { useAuthStore } from '@/store/authStore'
import type { Favorite } from '@/types/authTypes'

const FAVORITES_KEY = 'favorites'

export function useFavorites(workspaceId: string) {
  const query = useQuery({
    queryKey: [FAVORITES_KEY, workspaceId],
    queryFn: () => favoriteService.getFavorites(workspaceId),
    enabled: !!workspaceId,
  })

  const sets = useMemo(() => {
    const fileIds = new Set<string>()
    const folderIds = new Set<string>()
    for (const fav of query.data ?? []) {
      if (fav.resource_type === 'file') fileIds.add(fav.resource_id)
      else folderIds.add(fav.resource_id)
    }
    return { fileIds, folderIds }
  }, [query.data])

  return {
    ...query,
    favorites: query.data ?? ([] as Favorite[]),
    favoriteFileIds: sets.fileIds,
    favoriteFolderIds: sets.folderIds,
  }
}

export function useFavoriteResources(workspaceId: string) {
  return useQuery({
    queryKey: [FAVORITES_KEY, workspaceId, 'resources'],
    queryFn: () => favoriteService.getFavoriteResources(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useToggleFavorite(workspaceId: string) {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async ({
      resourceType,
      resourceId,
      isFavorite,
    }: {
      resourceType: 'file' | 'folder'
      resourceId: string
      isFavorite: boolean
    }) => {
      if (!userId) throw new Error('No autenticado')
      if (isFavorite) {
        await favoriteService.removeFavorite({ userId, resourceType, resourceId })
        return { action: 'removed' as const }
      }
      await favoriteService.addFavorite({
        userId,
        workspaceId,
        resourceType,
        resourceId,
      })
      return { action: 'added' as const }
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: [FAVORITES_KEY, workspaceId] })
      toast.success(result.action === 'added' ? 'Añadido a favoritos' : 'Quitado de favoritos')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al actualizar favoritos')
    },
  })
}
