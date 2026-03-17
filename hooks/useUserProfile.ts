import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useProfileStore, type UserProfile } from "@/store/profileStore";
import { useAuthStore } from "@/store/authStore";

export function useUserProfile() {
  const { profile, loading, setProfile, setLoading } = useProfileStore();
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (supabaseError && supabaseError.code !== "PGRST116") {
        throw supabaseError;
      }

      setProfile(data as UserProfile | null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load profile";
      setError(message);
      console.error("useUserProfile error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { profile, loading, error, refetch };
}
