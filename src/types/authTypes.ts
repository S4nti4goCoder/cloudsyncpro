import type { User, Session } from '@supabase/supabase-js'
import type { Database } from '@/types/databaseTypes'

export type UserRole = Database['public']['Enums']['user_role']
export type FileStatus = Database['public']['Enums']['file_status']
export type PermissionType = Database['public']['Enums']['permission_type']
export type ActivityAction = Database['public']['Enums']['activity_action']
export type ShareType = Database['public']['Enums']['share_type']

// Row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Workspace = Database['public']['Tables']['workspaces']['Row']
export type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row']
export type Folder = Database['public']['Tables']['folders']['Row']
export type FileRecord = Database['public']['Tables']['files']['Row']
export type FileVersion = Database['public']['Tables']['file_versions']['Row']
export type FileShare = Database['public']['Tables']['file_shares']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

export type UserProfile = Profile

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
}

export interface AuthActions {
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setSession: (session: Session | null) => void
  setIsLoading: (isLoading: boolean) => void
  setIsInitialized: (isInitialized: boolean) => void
  reset: () => void
}

export type AuthStore = AuthState & AuthActions