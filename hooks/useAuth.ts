import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import type { UserProfile } from "@/store/profileStore";

export function useAuth() {
  const { user, session, loading, setSession, setLoading } = useAuthStore();
  const { setProfile, clearProfile } = useProfileStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          clearProfile();
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }

      setProfile(data as UserProfile | null);
    } catch (err) {
      console.error("fetchProfile error:", err);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  return { user, session, loading };
}
