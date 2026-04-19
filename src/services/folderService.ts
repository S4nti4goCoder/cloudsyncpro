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
      .eq("status", "active")
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
   * Move a folder to trash (soft-delete, cascades to subfolders and files
   * via the trash_folder_cascade RPC).
   */
  async deleteFolder(id: string): Promise<void> {
    const { data: prev } = await supabase
      .from("folders")
      .select("name, workspace_id")
      .eq("id", id)
      .single();

    const { error } = await supabase.rpc("trash_folder_cascade", {
      p_folder_id: id,
    });

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
   * Restore a trashed folder (and all nested folders/files) back to active.
   */
  async restoreFolder(id: string): Promise<void> {
    const { data: prev } = await supabase
      .from("folders")
      .select("name, workspace_id")
      .eq("id", id)
      .single();

    const { error } = await supabase.rpc("restore_folder_cascade", {
      p_folder_id: id,
    });

    if (error) throw error;

    if (prev) {
      await activityService.logActivity({
        workspaceId: prev.workspace_id,
        action: "restore",
        resourceType: "folder",
        resourceId: id,
        resourceName: prev.name,
      });
    }
  },

  /**
   * Permanently delete a trashed folder: purges descendant files' R2 blobs
   * via the purge-files edge function, then removes the folder row
   * (ON DELETE CASCADE on folders.parent_id takes care of subfolders).
   */
  async permanentDeleteFolder(id: string): Promise<void> {
    const { data: prev } = await supabase
      .from("folders")
      .select("name, workspace_id")
      .eq("id", id)
      .single();

    const { data: descendantFileIds, error: descErr } = await supabase.rpc(
      "get_folder_descendant_files",
      { p_folder_id: id },
    );
    if (descErr) throw descErr;

    const ids = (descendantFileIds ?? []).map(
      (row: { file_id: string }) => row.file_id,
    );
    if (ids.length) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/purge-files`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ mode: "user_ids", ids }),
        },
      );
      if (!response.ok) {
        const err = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(err.error ?? "Error al purgar archivos de la carpeta");
      }
    }

    const { error } = await supabase.from("folders").delete().eq("id", id);
    if (error) throw error;

    if (prev) {
      await activityService.logActivity({
        workspaceId: prev.workspace_id,
        action: "delete",
        resourceType: "folder",
        resourceId: id,
        resourceName: prev.name,
        metadata: { permanent: true, descendant_files: ids.length },
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
   * Bulk move folders to trash via the trash_folder_cascade RPC (one call
   * per folder so each subtree cascades correctly).
   */
  async bulkDelete(ids: string[]): Promise<void> {
    if (!ids.length) return;
    const { data: prev } = await supabase
      .from("folders")
      .select("id, name, workspace_id")
      .in("id", ids);

    for (const id of ids) {
      const { error } = await supabase.rpc("trash_folder_cascade", {
        p_folder_id: id,
      });
      if (error) throw error;
    }

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
   * Bulk restore trashed folders.
   */
  async bulkRestoreFolders(ids: string[]): Promise<void> {
    if (!ids.length) return;
    const { data: prev } = await supabase
      .from("folders")
      .select("id, name, workspace_id")
      .in("id", ids);

    for (const id of ids) {
      const { error } = await supabase.rpc("restore_folder_cascade", {
        p_folder_id: id,
      });
      if (error) throw error;
    }

    if (prev?.length) {
      await Promise.all(
        prev.map((p) =>
          activityService.logActivity({
            workspaceId: p.workspace_id,
            action: "restore",
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
   * Bulk permanent delete trashed folders (one at a time so R2 blobs are
   * purged per subtree).
   */
  async bulkPermanentDeleteFolders(ids: string[]): Promise<void> {
    if (!ids.length) return;
    for (const id of ids) {
      await this.permanentDeleteFolder(id);
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
   * Get all active folders in a workspace (flat list for folder picker).
   */
  async getAllFolders(workspaceId: string): Promise<Folder[]> {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("status", "active")
      .order("name", { ascending: true });

    if (error) throw error;
    return data as Folder[];
  },

  /**
   * Get every trashed folder in a workspace (used for TrashPage display
   * and for resolving parent-folder names on trashed files). Callers
   * filter to top-level when needed.
   */
  async getTrashedFolders(workspaceId: string): Promise<Folder[]> {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("status", "deleted")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Folder[];
  },

  /**
   * Get folder breadcrumb path (only walks active folders).
   */
  async getFolderPath(folderId: string): Promise<Folder[]> {
    const path: Folder[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const result = await supabase
        .from("folders")
        .select(
          "id, name, parent_id, workspace_id, created_by, metadata, status, created_at, updated_at",
        )
        .eq("id", currentId)
        .eq("status", "active")
        .single();

      if (result.error || !result.data) break;

      const folder = result.data as unknown as Folder;
      path.unshift(folder);
      currentId = folder.parent_id;
    }

    return path;
  },
};
