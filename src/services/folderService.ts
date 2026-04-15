import { supabase } from "@/lib/supabase";
import type { Folder } from "@/types/authTypes";

export const folderService = {
  /**
   * Get folders by workspace and parent folder
   */
  async getFolders(
    workspaceId: string,
    parentId: string | null = null,
  ): Promise<Folder[]> {
    const query = supabase
      .from("folders")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("name", { ascending: true });

    if (parentId) {
      query.eq("parent_id", parentId);
    } else {
      query.is("parent_id", null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Folder[];
  },

  /**
   * Create a folder
   */
  async createFolder(input: {
    name: string;
    workspaceId: string;
    parentId?: string | null;
    createdBy: string;
  }): Promise<Folder> {
    const { data, error } = await supabase
      .from("folders")
      .insert({
        name: input.name,
        workspace_id: input.workspaceId,
        parent_id: input.parentId ?? null,
        created_by: input.createdBy,
        metadata: {},
      })
      .select()
      .single();

    if (error) throw error;
    return data as Folder;
  },

  /**
   * Rename a folder
   */
  async renameFolder(id: string, name: string): Promise<Folder> {
    const { data, error } = await supabase
      .from("folders")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Folder;
  },

  /**
   * Delete a folder
   */
  async deleteFolder(id: string): Promise<void> {
    const { error } = await supabase.from("folders").delete().eq("id", id);

    if (error) throw error;
  },

  /**
   * Get folder breadcrumb path
   */
  async getFolderPath(folderId: string): Promise<Folder[]> {
    const path: Folder[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const result = await supabase
        .from("folders")
        .select(
          "id, name, parent_id, workspace_id, created_by, metadata, created_at, updated_at",
        )
        .eq("id", currentId)
        .single();

      if (result.error || !result.data) break;

      const folder = result.data as unknown as Folder;
      path.unshift(folder);
      currentId = folder.parent_id;
    }

    return path;
  },
};
