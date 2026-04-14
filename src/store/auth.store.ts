import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AuthStore, AuthState } from '@/types/auth.types'

const initialState: AuthState = {
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isInitialized: false,
}

/**
 * Zustand store for authentication state.
 * Handles user, profile, and session data.
 */
export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }, false, 'auth/setUser'),
      setProfile: (profile) => set({ profile }, false, 'auth/setProfile'),
      setSession: (session) => set({ session }, false, 'auth/setSession'),
      setIsLoading: (isLoading) =>
        set({ isLoading }, false, 'auth/setIsLoading'),
      setIsInitialized: (isInitialized) =>
        set({ isInitialized }, false, 'auth/setIsInitialized'),

      reset: () => set(initialState, false, 'auth/reset'),
    }),
    { name: 'AuthStore' }
  )
)