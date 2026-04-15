import { supabase } from '@/lib/supabase'
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
    const { data, error } = await supabase
      .from('files')
      .update({ name })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as FileRecord
  },

  /**
   * Archive a file
   */
  async archiveFile(id: string): Promise<void> {
    const { error } = await supabase
      .from('files')
      .update({ status: 'archived' })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Restore a file from archive or trash
   */
  async restoreFile(id: string): Promise<void> {
    const { error } = await supabase
      .from('files')
      .update({ status: 'active' })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Move file to trash
   */
  async trashFile(id: string): Promise<void> {
    const { error } = await supabase
      .from('files')
      .update({ status: 'deleted' })
      .eq('id', id)

    if (error) throw error
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
    const { error } = await supabase
      .from('files')
      .update({ folder_id: folderId })
      .eq('id', id)

    if (error) throw error
  },
}