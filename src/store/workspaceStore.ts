import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Workspace } from '@/types/authTypes'

interface WorkspaceState {
  activeWorkspaceId: string | null
}

interface WorkspaceActions {
  setActiveWorkspaceId: (id: string | null) => void
}

type WorkspaceStore = WorkspaceState & WorkspaceActions

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
    }),
    { name: 'workspace-store' }
  )
)

/**
 * Returns the active workspace from a list of workspaces.
 * Falls back to the first workspace if no active one is set.
 */
export function getActiveWorkspace(
  workspaces: Workspace[],
  activeId: string | null
): Workspace | null {
  if (!workspaces.length) return null
  return workspaces.find((w) => w.id === activeId) ?? workspaces[0] ?? null
}