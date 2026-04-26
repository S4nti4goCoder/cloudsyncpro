import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { shareService } from '@/services/shareService'
import { useAuthStore } from '@/store/authStore'

const SHARES_KEY = 'shares'

export function useMyShares() {
  return useQuery({
    queryKey: [SHARES_KEY, 'mine'],
    queryFn: () => shareService.getMyShares(),
  })
}

export function useSharedWithMe() {
  return useQuery({
    queryKey: [SHARES_KEY, 'with-me'],
    queryFn: () => shareService.getSharedWithMe(),
  })
}

export function useShares(resourceId: string) {
  return useQuery({
    queryKey: [SHARES_KEY, resourceId],
    queryFn: () => shareService.getShares(resourceId),
    enabled: !!resourceId,
  })
}

export function useCreateShare(resourceId: string) {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: (input: {
      shareType: 'public' | 'user'
      permissions: ('view' | 'edit' | 'delete' | 'share')[]
      expiresAt?: string | null
      password?: string | null
    }) =>
      shareService.createShare({
        resourceId,
        resourceType: 'file',
        shareType: input.shareType,
        permissions: input.permissions,
        expiresAt: input.expiresAt,
        password: input.password,
        sharedBy: userId!,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [SHARES_KEY, resourceId] })
      toast.success('Enlace creado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al crear el enlace')
    },
  })
}

export function useDeactivateShare() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => shareService.deactivateShare(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [SHARES_KEY] })
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al desactivar el enlace')
    },
  })
}