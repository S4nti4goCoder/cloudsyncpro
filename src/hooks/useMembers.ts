import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { memberService } from "@/services/memberService";
import type { UserRole } from "@/types/authTypes";

const MEMBERS_KEY = "workspace-members";

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: [MEMBERS_KEY, workspaceId],
    queryFn: () => memberService.getMembers(workspaceId),
    enabled: !!workspaceId,
    staleTime: 30_000,
  });
}

export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: UserRole }) =>
      memberService.inviteMember(workspaceId, email, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [MEMBERS_KEY, workspaceId],
      });
      toast.success("Miembro agregado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: UserRole }) =>
      memberService.updateMemberRole(memberId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [MEMBERS_KEY, workspaceId],
      });
      toast.success("Rol actualizado");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Error al actualizar el rol");
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => memberService.removeMember(memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [MEMBERS_KEY, workspaceId],
      });
      toast.success("Miembro eliminado del workspace");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Error al eliminar miembro");
    },
  });
}
