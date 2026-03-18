import { useEffect } from "react";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import type { UserProfile } from "@/store/profileStore";

export function useAuth() {
  const { user, session, loading, setSession, setLoading: setAuthLoading } = useAuthStore();
  const {
    setProfile,
    clearProfile,
    setLoading: setProfileLoading,
  } = useProfileStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setProfileLoading(true);
        fetchProfile(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          setProfileLoading(true);
          await fetchProfile(session.user.id);
        } else {
          clearProfile();
          setAuthLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 12000);
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .abortSignal(controller.signal)
        .single();

      if (error) {
        // No row yet is expected for new users.
        if (error.code === "PGRST116") {
          setProfile(null);
          return;
        }

        // Missing table in local/dev schema should not block auth flow.
        if (error.code === "PGRST205") {
          setProfile(null);
          return;
        }

        const message = (error.message ?? "").toLowerCase();
        const shouldForceReauth =
          error.code === "PGRST301" ||
          message.includes("jwt") ||
          message.includes("invalid token");
        if (shouldForceReauth) {
          await supabase.auth.signOut();
          clearProfile();
          setSession(null);
          router.replace("/(auth)/login");
          return;
        }

        console.error("Error fetching profile:", error);
      }

      setProfile(data as UserProfile | null);
    } catch (err) {
      console.error("fetchProfile error:", err);
      setProfile(null);
      setProfileLoading(false);
      setAuthLoading(false);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setProfileLoading(false);
      setAuthLoading(false);
    }
  }

  return { user, session, loading };
}
