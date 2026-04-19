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
      const [
        filesResult,
        foldersResult,
        archivedResult,
        trashedFilesResult,
        trashedFoldersResult,
      ] = await Promise.all([
        supabase
          .from("files")
          .select("size, mime_type")
          .eq("workspace_id", workspaceId)
          .eq("status", "active"),
        supabase
          .from("folders")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "active"),
        supabase
          .from("files")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "archived"),
        supabase
          .from("files")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "deleted"),
        supabase
          .from("folders")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "deleted"),
      ]);

      if (filesResult.error) throw filesResult.error;
      if (foldersResult.error) throw foldersResult.error;
      if (archivedResult.error) throw archivedResult.error;
      if (trashedFilesResult.error) throw trashedFilesResult.error;
      if (trashedFoldersResult.error) throw trashedFoldersResult.error;

      const files = filesResult.data ?? [];
      const total_size = files.reduce((acc, f) => acc + (f.size ?? 0), 0);
      const files_by_type: Record<string, number> = {};
      for (const f of files) {
        const cat = categorizeMime(f.mime_type);
        files_by_type[cat] = (files_by_type[cat] ?? 0) + 1;
      }

      return {
        total_files: files.length,
        total_size,
        total_folders: foldersResult.count ?? 0,
        total_archived: archivedResult.count ?? 0,
        total_trashed:
          (trashedFilesResult.count ?? 0) + (trashedFoldersResult.count ?? 0),
        files_by_type,
      };
    },
    enabled: !!workspaceId,
  });
}

function categorizeMime(mime: string | null | undefined): string {
  if (!mime) return "other";
  if (mime.startsWith("image/")) return "images";
  if (mime.startsWith("video/")) return "videos";
  if (mime.startsWith("audio/")) return "audio";
  if (
    mime === "text/csv" ||
    mime === "application/vnd.ms-excel" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return "spreadsheets";
  if (
    mime.startsWith("text/") ||
    mime === "application/pdf" ||
    mime === "application/msword" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "documents";
  return "other";
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

      const { data: memberships, error: mErr } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", userId);
      if (mErr) throw mErr;

      const workspaceIds = (memberships ?? []).map((m) => m.workspace_id);

      if (workspaceIds.length === 0) {
        return {
          totalFiles: 0,
          totalSize: 0,
          totalWorkspaces: 0,
          totalFolders: 0,
        };
      }

      const [filesResult, foldersResult] = await Promise.all([
        supabase
          .from("files")
          .select("size")
          .in("workspace_id", workspaceIds)
          .eq("status", "active"),
        supabase
          .from("folders")
          .select("id", { count: "exact", head: true })
          .in("workspace_id", workspaceIds)
          .eq("status", "active"),
      ]);

      if (filesResult.error) throw filesResult.error;
      if (foldersResult.error) throw foldersResult.error;

      const files = filesResult.data ?? [];
      const totalSize = files.reduce((acc, f) => acc + (f.size ?? 0), 0);

      return {
        totalFiles: files.length,
        totalSize,
        totalWorkspaces: workspaceIds.length,
        totalFolders: foldersResult.count ?? 0,
      };
    },
  });
}

export function useUploadActivity(workspaceId: string) {
  return useQuery({
    queryKey: ["upload-activity", workspaceId],
    queryFn: async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      const { data, error } = await supabase
        .from("files")
        .select("created_at, size")
        .eq("workspace_id", workspaceId)
        .eq("status", "active")
        .gte("created_at", cutoff.toISOString())
        .order("created_at", { ascending: true });

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
