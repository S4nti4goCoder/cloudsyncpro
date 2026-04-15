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

export function useSearch(query: string) {
  const { activeWorkspaceId } = useWorkspaceStore()
  const { data: workspaces } = useWorkspaces()
  const activeWorkspace = getActiveWorkspace(workspaces ?? [], activeWorkspaceId)
  const workspaceId = activeWorkspace?.id ?? ''

  return useQuery({
    queryKey: ['search', workspaceId, query],
    queryFn: async () => {
      if (!query.trim() || !workspaceId) return []

      const { data, error } = await supabase.rpc('search_files', {
        p_workspace_id: workspaceId,
        p_query: query.trim(),
        p_limit: 20,
        p_offset: 0,
      })

      if (error) throw error
      return (data ?? []) as SearchResult[]
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