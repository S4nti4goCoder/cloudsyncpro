import type { User, Session } from '@supabase/supabase-js'
import type { UserRole } from '@/types/database.types'

/**
 * Extended user profile stored in the `profiles` table.
 * Linked 1:1 with Supabase Auth users.
 */
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

/**
 * Auth state managed by Zustand.
 */
export interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
}

/**
 * Auth actions managed by Zustand.
 */
export interface AuthActions {
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setSession: (session: Session | null) => void
  setIsLoading: (isLoading: boolean) => void
  setIsInitialized: (isInitialized: boolean) => void
  reset: () => void
}

export type AuthStore = AuthState & AuthActions