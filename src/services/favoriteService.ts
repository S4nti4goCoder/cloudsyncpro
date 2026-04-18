import { supabase } from "@/lib/supabase";
import type { Favorite, FileRecord, Folder } from "@/types/authTypes";

export const favoriteService = {
  async getFavorites(workspaceId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Favorite[];
  },

  async addFavorite(input: {
    userId: string;
    workspaceId: string;
    resourceType: "file" | "folder";
    resourceId: string;
  }): Promise<Favorite> {
    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: input.userId,
        workspace_id: input.workspaceId,
        resource_type: input.resourceType,
        resource_id: input.resourceId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Favorite;
  },

  async removeFavorite(input: {
    userId: string;
    resourceType: "file" | "folder";
    resourceId: string;
  }): Promise<void> {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", input.userId)
      .eq("resource_type", input.resourceType)
      .eq("resource_id", input.resourceId);

    if (error) throw error;
  },

  /**
   * Fetch the full file/folder records for a user's favorites in this workspace.
   * Trashed files are filtered out automatically.
   */
  async getFavoriteResources(
    workspaceId: string,
  ): Promise<{ files: FileRecord[]; folders: Folder[] }> {
    const favorites = await this.getFavorites(workspaceId);
    const fileIds = favorites
      .filter((f) => f.resource_type === "file")
      .map((f) => f.resource_id);
    const folderIds = favorites
      .filter((f) => f.resource_type === "folder")
      .map((f) => f.resource_id);

    const filesPromise = fileIds.length
      ? supabase
          .from("files")
          .select("*")
          .in("id", fileIds)
          .neq("status", "deleted")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as FileRecord[], error: null });

    const foldersPromise = folderIds.length
      ? supabase
          .from("folders")
          .select("*")
          .in("id", folderIds)
          .order("name", { ascending: true })
      : Promise.resolve({ data: [] as Folder[], error: null });

    const [filesResult, foldersResult] = await Promise.all([
      filesPromise,
      foldersPromise,
    ]);

    if (filesResult.error) throw filesResult.error;
    if (foldersResult.error) throw foldersResult.error;

    return {
      files: (filesResult.data ?? []) as FileRecord[],
      folders: (foldersResult.data ?? []) as Folder[],
    };
  },
};
