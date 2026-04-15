import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { workspaceService } from '@/services/workspaceService'

const WORKSPACES_KEY = ['workspaces']

export function useWorkspaces() {
  return useQuery({
    queryKey: WORKSPACES_KEY,
    queryFn: () => workspaceService.getMyWorkspaces(),
  })
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: [...WORKSPACES_KEY, id],
    queryFn: () => workspaceService.getWorkspace(id),
    enabled: !!id,
  })
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { name: string; description?: string; slug: string }) =>
      workspaceService.createWorkspace(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WORKSPACES_KEY })
      toast.success('Espacio de trabajo creado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al crear el espacio de trabajo')
    },
  })
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; name?: string; description?: string }) =>
      workspaceService.updateWorkspace(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WORKSPACES_KEY })
      toast.success('Espacio de trabajo actualizado')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al actualizar el espacio de trabajo')
    },
  })
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => workspaceService.deleteWorkspace(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WORKSPACES_KEY })
      toast.success('Espacio de trabajo eliminado')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al eliminar el espacio de trabajo')
    },
  })
}