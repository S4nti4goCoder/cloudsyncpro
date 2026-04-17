import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore, getActiveWorkspace } from "@/store/workspaceStore";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import type { UserRole } from "@/types/authTypes";

export interface WorkspacePermissions {
  role: UserRole | null;
  isOwner: boolean;
  isLoading: boolean;
  canEdit: boolean;
  canManage: boolean;
  canDelete: boolean;
  canShare: boolean;
  canUpload: boolean;
  isViewer: boolean;
}

export function useWorkspaceRole(): WorkspacePermissions {
  const userId = useAuthStore((s) => s.user?.id);
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  const activeWorkspace = getActiveWorkspace(workspaces ?? [], activeWorkspaceId);
  const workspaceId = activeWorkspace?.id ?? null;

  const isOwner = !!userId && activeWorkspace?.owner_id === userId;

  const { data: role, isLoading } = useQuery({
    queryKey: ["workspace-role", workspaceId, userId],
    queryFn: async (): Promise<UserRole | null> => {
      if (!workspaceId || !userId) return null;
      const { data, error } = await supabase
        .from("workspace_members")
        .select("role")
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data?.role ?? null) as UserRole | null;
    },
    enabled: !!workspaceId && !!userId && !isOwner,
    staleTime: 60_000,
  });

  const effectiveRole: UserRole | null = isOwner ? "admin" : (role ?? null);
  const canManage = isOwner || effectiveRole === "admin";
  const canEdit =
    canManage || effectiveRole === "editor";
  const isViewer = !canEdit && effectiveRole === "viewer";

  return {
    role: effectiveRole,
    isOwner,
    isLoading: !isOwner && isLoading,
    canEdit,
    canManage,
    canDelete: canEdit,
    canShare: canEdit,
    canUpload: canEdit,
    isViewer,
  };
}
