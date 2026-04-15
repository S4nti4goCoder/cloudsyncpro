import { supabase } from '@/lib/supabase'
import type { Workspace, WorkspaceMember } from '@/types/authTypes'

export const workspaceService = {
  /**
   * Get all workspaces for the current user
   */
  async getMyWorkspaces(): Promise<Workspace[]> {
    const { data, error } = await supabase
      .from('workspaces')
      .select(`
        *,
        workspace_members!inner(user_id)
      `)
      .eq('workspace_members.user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as Workspace[]
  },

  /**
   * Get a single workspace by ID
   */
  async getWorkspace(id: string): Promise<Workspace> {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Workspace
  },

  /**
   * Create a new workspace
   */
  async createWorkspace(input: {
    name: string
    description?: string
    slug: string
  }): Promise<Workspace> {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        name: input.name,
        description: input.description ?? null,
        slug: input.slug,
        owner_id: userId,
      })
      .select()
      .single()

    if (error) throw error

    // Add creator as admin member
    await supabase.from('workspace_members').insert({
      workspace_id: data.id,
      user_id: userId,
      role: 'admin',
    })

    return data as Workspace
  },

  /**
   * Update a workspace
   */
  async updateWorkspace(
    id: string,
    input: { name?: string; description?: string }
  ): Promise<Workspace> {
    const { data, error } = await supabase
      .from('workspaces')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Workspace
  },

  /**
   * Delete a workspace
   */
  async deleteWorkspace(id: string): Promise<void> {
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Get workspace members
   */
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)

    if (error) throw error
    return data as WorkspaceMember[]
  },

  /**
   * Generate a unique slug from a name
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50)
      + '-' + Math.random().toString(36).slice(2, 7)
  },
}