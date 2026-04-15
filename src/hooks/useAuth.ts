import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { UserProfile } from "@/types/authTypes";

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) return null;
    return data as UserProfile;
  } catch {
    return null;
  }
}

export function useAuthInitializer(): void {
  useEffect(() => {
    const store = useAuthStore.getState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      store.setSession(session);
      store.setUser(session?.user ?? null);
      store.setIsLoading(false);
      store.setIsInitialized(true);

      // Fetch profile in background without blocking
      if (session?.user) {
        fetchProfile(session.user.id).then((profile) => {
          store.setProfile(profile);
        });
      } else {
        store.setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
}

export function useAuth() {
  return useAuthStore((state) => ({
    user: state.user,
    profile: state.profile,
    session: state.session,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    isAuthenticated: state.user !== null,
    isAdmin:
      state.profile?.role === "admin" || state.profile?.role === "superadmin",
    isSuperAdmin: state.profile?.role === "superadmin",
  }));
}
