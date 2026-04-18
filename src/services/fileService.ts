import { supabase } from '@/lib/supabase'
import { activityService } from '@/services/activityService'
import type { FileRecord } from '@/types/authTypes'

type PurgeMode = 'user_ids' | 'user_workspace_trash'
interface PurgeResponse { purged: number; blobs_deleted: number }

async function callPurgeFiles(
  body: { mode: PurgeMode; ids?: string[]; workspaceId?: string },
): Promise<PurgeResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/purge-files`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    },
  )
  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error ?? 'Error al purgar archivos')
  }
  return response.json() as Promise<PurgeResponse>
}

export const fileService = {
  /**
   * Get files by workspace and folder
   */
  async getFiles(
    workspaceId: string,
    folderId: string | null = null
  ): Promise<FileRecord[]> {
    const query = supabase
      .from('files')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (folderId) {
      query.eq('folder_id', folderId)
    } else {
      query.is('folder_id', null)
    }

    const { data, error } = await query
    if (error) throw error
    return data as FileRecord[]
  },

  /**
   * Get archived files
   */
  async getArchivedFiles(workspaceId: string): Promise<FileRecord[]> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('status', 'archived')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data as FileRecord[]
  },

  /**
   * Get deleted files (trash)
   */
  async getDeletedFiles(workspaceId: string): Promise<FileRecord[]> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('status', 'deleted')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data as FileRecord[]
  },

  /**
   * Rename a file
   */
  async renameFile(id: string, name: string): Promise<FileRecord> {
    const { data: prev } = await supabase
      .from('files')
      .select('name, workspace_id')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('files')
      .update({ name })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (prev) {
      await activityService.logActivity({
        workspaceId: prev.workspace_id,
        action: 'rename',
        resourceType: 'file',
        resourceId: id,
        resourceName: name,
        metadata: { previous_name: prev.name },
      })
    }

    return data as FileRecord
  },

  /**
   * Archive a file
   */
  async archiveFile(id: string): Promise<void> {
    const { data: prev } = await supabase
      .from('files')
      .select('name, workspace_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('files')
      .update({ status: 'archived' })
      .eq('id', id)

    if (error) throw error

    if (prev) {
      await activityService.logActivity({
        workspaceId: prev.workspace_id,
        action: 'archive',
        resourceType: 'file',
        resourceId: id,
        resourceName: prev.name,
      })
    }
  },

  /**
   * Restore a file from archive or trash
   */
  async restoreFile(id: string): Promise<void> {
    const { data: prev } = await supabase
      .from('files')
      .select('name, workspace_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('files')
      .update({ status: 'active' })
      .eq('id', id)

    if (error) throw error

    if (prev) {
      await activityService.logActivity({
        workspaceId: prev.workspace_id,
        action: 'restore',
        resourceType: 'file',
        resourceId: id,
        resourceName: prev.name,
      })
    }
  },

  /**
   * Move file to trash
   */
  async trashFile(id: string): Promise<void> {
    const { data: prev } = await supabase
      .from('files')
      .select('name, workspace_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('files')
      .update({ status: 'deleted' })
      .eq('id', id)

    if (error) throw error

    if (prev) {
      await activityService.logActivity({
        workspaceId: prev.workspace_id,
        action: 'delete',
        resourceType: 'file',
        resourceId: id,
        resourceName: prev.name,
      })
    }
  },

  /**
   * Permanently delete a file (purges both the R2 blob and the DB row via
   * the purge-files edge function).
   */
  async deleteFile(id: string): Promise<void> {
    const { data: prev } = await supabase
      .from('files')
      .select('name, workspace_id')
      .eq('id', id)
      .single()

    await callPurgeFiles({ mode: 'user_ids', ids: [id] })

    if (prev) {
      await activityService.logActivity({
        workspaceId: prev.workspace_id,
        action: 'delete',
        resourceType: 'file',
        resourceId: id,
        resourceName: prev.name,
        metadata: { permanent: true },
      })
    }
  },

  /**
   * Bulk restore: set status='active' for multiple files at once.
   * Used from the trash and archived pages.
   */
  async bulkRestore(ids: string[]): Promise<void> {
    if (!ids.length) return
    const { data: prev } = await supabase
      .from('files')
      .select('id, name, workspace_id')
      .in('id', ids)

    const { error } = await supabase
      .from('files')
      .update({ status: 'active' })
      .in('id', ids)

    if (error) throw error

    if (prev?.length) {
      await Promise.all(
        prev.map((p) =>
          activityService.logActivity({
            workspaceId: p.workspace_id,
            action: 'restore',
            resourceType: 'file',
            resourceId: p.id,
            resourceName: p.name,
          }),
        ),
      )
    }
  },

  /**
   * Bulk permanent delete: purges both R2 blobs and DB rows via the
   * purge-files edge function.
   */
  async bulkDelete(ids: string[]): Promise<void> {
    if (!ids.length) return
    const { data: prev } = await supabase
      .from('files')
      .select('id, name, workspace_id')
      .in('id', ids)

    await callPurgeFiles({ mode: 'user_ids', ids })

    if (prev?.length) {
      await Promise.all(
        prev.map((p) =>
          activityService.logActivity({
            workspaceId: p.workspace_id,
            action: 'delete',
            resourceType: 'file',
            resourceId: p.id,
            resourceName: p.name,
            metadata: { permanent: true, bulk: true },
          }),
        ),
      )
    }
  },

  /**
   * Empty trash for a workspace: purges all files with status='deleted'
   * (R2 blobs + DB rows) via the purge-files edge function.
   */
  async emptyTrash(workspaceId: string): Promise<number> {
    const { data: prev } = await supabase
      .from('files')
      .select('id, name')
      .eq('workspace_id', workspaceId)
      .eq('status', 'deleted')

    const ids = prev?.map((p) => p.id) ?? []
    if (!ids.length) return 0

    const { purged } = await callPurgeFiles({
      mode: 'user_workspace_trash',
      workspaceId,
    })

    await activityService.logActivity({
      workspaceId,
      action: 'delete',
      resourceType: 'file',
      resourceId: ids[0]!,
      resourceName: `${ids.length} archivos`,
      metadata: { permanent: true, bulk: true, empty_trash: true, count: purged },
    })

    return purged
  },

  /**
   * Move file to a different folder
   */
  async moveFile(id: string, folderId: string | null): Promise<void> {
    const { data: prev } = await supabase
      .from('files')
      .select('name, workspace_id, folder_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('files')
      .update({ folder_id: folderId })
      .eq('id', id)

    if (error) throw error

    if (prev) {
      await activityService.logActivity({
        workspaceId: prev.workspace_id,
        action: 'move',
        resourceType: 'file',
        resourceId: id,
        resourceName: prev.name,
        metadata: { from_folder: prev.folder_id, to_folder: folderId },
      })
    }
  },
}