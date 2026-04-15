import { supabase } from '@/lib/supabase'
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
    return data as FileShare
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
    const { error } = await supabase
      .from('file_shares')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
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