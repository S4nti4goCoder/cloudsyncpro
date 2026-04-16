import { supabase } from '@/lib/supabase'
import { activityService } from '@/services/activityService'
import type { FileRecord } from '@/types/authTypes'

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
   * Permanently delete a file
   */
  async deleteFile(id: string): Promise<void> {
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id)

    if (error) throw error
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