import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useWorkspaceStore, getActiveWorkspace } from '@/store/workspaceStore'
import { useWorkspaces } from '@/hooks/useWorkspaces'

export interface SearchResult {
  id: string
  name: string
  mime_type: string
  size: number
  extension: string
  folder_id: string | null
  folder_name: string | null
  uploaded_by: string
  status: string
  metadata: unknown
  created_at: string
  updated_at: string
  relevance: number
}

export interface FolderSearchResult {
  id: string
  name: string
  parent_id: string | null
}

export interface CombinedSearchResults {
  files: SearchResult[]
  folders: FolderSearchResult[]
}

export function useSearch(query: string) {
  const { activeWorkspaceId } = useWorkspaceStore()
  const { data: workspaces } = useWorkspaces()
  const activeWorkspace = getActiveWorkspace(workspaces ?? [], activeWorkspaceId)
  const workspaceId = activeWorkspace?.id ?? ''

  return useQuery<CombinedSearchResults>({
    queryKey: ['search', workspaceId, query],
    queryFn: async () => {
      if (!query.trim() || !workspaceId) return { files: [], folders: [] }

      const [filesRes, foldersRes] = await Promise.all([
        supabase.rpc('search_files', {
          p_workspace_id: workspaceId,
          p_query: query.trim(),
          p_limit: 15,
          p_offset: 0,
        }),
        supabase
          .from('folders')
          .select('id, name, parent_id')
          .eq('workspace_id', workspaceId)
          .ilike('name', `%${query.trim()}%`)
          .limit(5),
      ])

      if (filesRes.error) throw filesRes.error
      if (foldersRes.error) throw foldersRes.error

      return {
        files: (filesRes.data ?? []) as SearchResult[],
        folders: (foldersRes.data ?? []) as FolderSearchResult[],
      }
    },
    enabled: !!query.trim() && !!workspaceId,
    staleTime: 0,
  })
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
