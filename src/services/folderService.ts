import { supabase } from "@/lib/supabase";
import { activityService } from "@/services/activityService";
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

    await activityService.logActivity({
      workspaceId: input.workspaceId,
      action: "create_folder",
      resourceType: "folder",
      resourceId: data.id,
      resourceName: data.name,
      metadata: { parent_id: input.parentId ?? null },
    });

    return data as Folder;
  },

  /**
   * Rename a folder
   */
  async renameFolder(id: string, name: string): Promise<Folder> {
    const { data: prev } = await supabase
      .from("folders")
      .select("name, workspace_id")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("folders")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (prev) {
      await activityService.logActivity({
        workspaceId: prev.workspace_id,
        action: "rename",
        resourceType: "folder",
        resourceId: id,
        resourceName: name,
        metadata: { previous_name: prev.name },
      });
    }

    return data as Folder;
  },

  /**
   * Delete a folder
   */
  async deleteFolder(id: string): Promise<void> {
    const { data: prev } = await supabase
      .from("folders")
      .select("name, workspace_id")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("folders").delete().eq("id", id);

    if (error) throw error;

    if (prev) {
      await activityService.logActivity({
        workspaceId: prev.workspace_id,
        action: "delete",
        resourceType: "folder",
        resourceId: id,
        resourceName: prev.name,
      });
    }
  },

  /**
   * Set folder color (stored inside metadata.color).
   */
  async setFolderColor(id: string, color: string | null): Promise<Folder> {
    const { data: prev } = await supabase
      .from("folders")
      .select("metadata")
      .eq("id", id)
      .single();

    const baseMetadata =
      prev?.metadata && typeof prev.metadata === "object" && !Array.isArray(prev.metadata)
        ? (prev.metadata as Record<string, unknown>)
        : {};
    const nextMetadata = { ...baseMetadata, color: color ?? null };

    const { data, error } = await supabase
      .from("folders")
      .update({ metadata: nextMetadata })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Folder;
  },

  /**
   * Bulk delete folders.
   */
  async bulkDelete(ids: string[]): Promise<void> {
    if (!ids.length) return;
    const { data: prev } = await supabase
      .from("folders")
      .select("id, name, workspace_id")
      .in("id", ids);

    const { error } = await supabase.from("folders").delete().in("id", ids);
    if (error) throw error;

    if (prev?.length) {
      await Promise.all(
        prev.map((p) =>
          activityService.logActivity({
            workspaceId: p.workspace_id,
            action: "delete",
            resourceType: "folder",
            resourceId: p.id,
            resourceName: p.name,
            metadata: { bulk: true },
          }),
        ),
      );
    }
  },

  /**
   * Bulk move folders to a different parent folder.
   */
  async bulkMove(ids: string[], targetParentId: string | null): Promise<void> {
    if (!ids.length) return;
    const { data: prev } = await supabase
      .from("folders")
      .select("id, name, workspace_id, parent_id")
      .in("id", ids);

    const { error } = await supabase
      .from("folders")
      .update({ parent_id: targetParentId })
      .in("id", ids);

    if (error) throw error;

    if (prev?.length) {
      await Promise.all(
        prev.map((p) =>
          activityService.logActivity({
            workspaceId: p.workspace_id,
            action: "move",
            resourceType: "folder",
            resourceId: p.id,
            resourceName: p.name,
            metadata: { from_parent: p.parent_id, to_parent: targetParentId, bulk: true },
          }),
        ),
      );
    }
  },

  /**
   * Get all folders in a workspace (flat list for folder picker)
   */
  async getAllFolders(workspaceId: string): Promise<Folder[]> {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("name", { ascending: true });

    if (error) throw error;
    return data as Folder[];
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
