import { useQuery, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Invalidate every dashboard query so stats and recent lists refresh
 * after a file/folder mutation. Called from useFiles / useFolders.
 */
export function invalidateDashboardQueries(
  queryClient: QueryClient,
  workspaceId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: ["global-stats"] });
  if (workspaceId) {
    void queryClient.invalidateQueries({
      queryKey: ["workspace-stats", workspaceId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["recent-files", workspaceId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["upload-activity", workspaceId],
    });
  }
}

export function useWorkspaceStats(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-stats", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_workspace_stats", {
        p_workspace_id: workspaceId,
      });

      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: !!workspaceId,
  });
}

export function useRecentFiles(workspaceId: string, limit = 5) {
  return useQuery({
    queryKey: ["recent-files", workspaceId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });
}

export function useGlobalStats() {
  return useQuery({
    queryKey: ["global-stats"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return null;

      const [filesResult, workspacesResult, foldersResult] = await Promise.all([
        supabase
          .from("files")
          .select("size", { count: "exact" })
          .eq("uploaded_by", userId)
          .eq("status", "active"),
        supabase
          .from("workspace_members")
          .select("workspace_id", { count: "exact" })
          .eq("user_id", userId),
        supabase
          .from("folders")
          .select("id", { count: "exact" })
          .eq("created_by", userId)
          .eq("status", "active"),
      ]);

      const totalSize = (filesResult.data ?? []).reduce(
        (acc, f) => acc + (f.size ?? 0),
        0,
      );

      return {
        totalFiles: filesResult.count ?? 0,
        totalSize,
        totalWorkspaces: workspacesResult.count ?? 0,
        totalFolders: foldersResult.count ?? 0,
      };
    },
  });
}

export function useUploadActivity(workspaceId: string) {
  return useQuery({
    queryKey: ["upload-activity", workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("files")
        .select("created_at, size")
        .eq("workspace_id", workspaceId)
        .eq("status", "active")
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      // Group by day
      const grouped: Record<string, { uploads: number; size: number }> = {};

      for (const file of data ?? []) {
        const day = new Date(file.created_at).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
        });
        if (!grouped[day]) grouped[day] = { uploads: 0, size: 0 };
        grouped[day].uploads += 1;
        grouped[day].size += file.size ?? 0;
      }

      return Object.entries(grouped).map(([date, values]) => ({
        date,
        uploads: values.uploads,
        size: Math.round((values.size / 1024 / 1024) * 10) / 10,
      }));
    },
    enabled: !!workspaceId,
  });
}
