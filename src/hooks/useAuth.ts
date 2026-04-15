import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { UserProfile } from '@/types/authTypes'

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[useAuth] Error fetching profile:', error.message)
    return null
  }

  return data as UserProfile
}

export function useAuthInitializer(): void {
  useEffect(() => {
    const { setUser, setProfile, setSession, setIsLoading, setIsInitialized, reset } =
      useAuthStore.getState()

    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setProfile(profile)
      }

      setIsLoading(false)
      setIsInitialized(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          setIsLoading(true)
          const profile = await fetchProfile(session.user.id)
          setProfile(profile)
          setIsLoading(false)
        }

        if (event === 'SIGNED_OUT') {
          reset()
          setIsInitialized(true)
        }
      }
    )

    return () => { subscription.unsubscribe() }
  }, []) // <- array vacío, se ejecuta solo una vez
}

export function useAuth() {
  return useAuthStore((state) => ({
    user: state.user,
    profile: state.profile,
    session: state.session,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    isAuthenticated: state.user !== null,
    isAdmin: state.profile?.role === 'admin' || state.profile?.role === 'superadmin',
    isSuperAdmin: state.profile?.role === 'superadmin',
  }))
}