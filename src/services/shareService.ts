import { supabase } from '@/lib/supabase'
import { activityService } from '@/services/activityService'
import type { FileShare } from '@/types/authTypes'

export const shareService = {
  /**
   * Create a share link for a file
   */
  async createShare(input: {
    resourceId: string
    resourceType: 'file' | 'folder'
    shareType: 'public' | 'user'
    permissions: ('view' | 'edit' | 'delete' | 'share')[]
    expiresAt?: string | null
    password?: string | null
    sharedBy: string
  }): Promise<FileShare> {
    const { data, error } = await supabase
      .from('file_shares')
      .insert({
        resource_id: input.resourceId,
        resource_type: input.resourceType,
        share_type: input.shareType,
        permissions: input.permissions,
        expires_at: input.expiresAt ?? null,
        password: input.password ?? null,
        shared_by: input.sharedBy,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    const table = input.resourceType === 'folder' ? 'folders' : 'files'
    const { data: resource } = await supabase
      .from(table)
      .select('name, workspace_id')
      .eq('id', input.resourceId)
      .single()

    if (resource) {
      await activityService.logActivity({
        workspaceId: resource.workspace_id,
        action: 'share',
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        resourceName: resource.name,
        metadata: {
          share_type: input.shareType,
          permissions: input.permissions,
          expires_at: input.expiresAt ?? null,
        },
      })
    }

    return data as FileShare
  },

  /**
   * Get all active shares created by the current user, enriched with resource name
   */
  async getMyShares(): Promise<(FileShare & { resource_name: string })[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No hay sesión activa')

    const { data: shares, error } = await supabase
      .from('file_shares')
      .select('*')
      .eq('shared_by', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    const enriched = shares as (FileShare & { resource_name: string })[]

    // Batch-fetch file and folder names
    const fileIds = enriched.filter((s) => s.resource_type === 'file').map((s) => s.resource_id)
    const folderIds = enriched.filter((s) => s.resource_type === 'folder').map((s) => s.resource_id)

    const nameMap = new Map<string, string>()

    if (fileIds.length > 0) {
      const { data: files } = await supabase
        .from('files')
        .select('id, name')
        .in('id', fileIds)
      files?.forEach((f) => nameMap.set(f.id, f.name))
    }

    if (folderIds.length > 0) {
      const { data: folders } = await supabase
        .from('folders')
        .select('id, name')
        .in('id', folderIds)
      folders?.forEach((f) => nameMap.set(f.id, f.name))
    }

    for (const share of enriched) {
      share.resource_name = nameMap.get(share.resource_id) ?? 'Recurso eliminado'
    }

    return enriched
  },

  /**
   * Get all shares for a resource
   */
  async getShares(resourceId: string): Promise<FileShare[]> {
    const { data, error } = await supabase
      .from('file_shares')
      .select('*')
      .eq('resource_id', resourceId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as FileShare[]
  },

  /**
   * Deactivate a share
   */
  async deactivateShare(id: string): Promise<void> {
    const { data: prev } = await supabase
      .from('file_shares')
      .select('resource_id, resource_type')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('file_shares')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error

    if (prev) {
      const table = prev.resource_type === 'folder' ? 'folders' : 'files'
      const { data: resource } = await supabase
        .from(table)
        .select('name, workspace_id')
        .eq('id', prev.resource_id)
        .single()

      if (resource) {
        await activityService.logActivity({
          workspaceId: resource.workspace_id,
          action: 'unshare',
          resourceType: prev.resource_type as 'file' | 'folder',
          resourceId: prev.resource_id,
          resourceName: resource.name,
        })
      }
    }
  },

  /**
   * Get shared file by token (public access)
   */
  async getSharedFile(token: string) {
    const { data, error } = await supabase
      .rpc('get_shared_file', { p_token: token })

    if (error) throw error
    return data?.[0] ?? null
  },

  /**
   * Verify share password
   */
  async verifyPassword(token: string, password: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('file_shares')
      .select('password')
      .eq('token', token)
      .single()

    if (error) return false
    return data.password === password
  },

  /**
   * Build public share URL
   */
  buildShareUrl(token: string): string {
    return `${window.location.origin}/shared/${token}`
  },
}