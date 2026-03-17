import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";

interface DailyReading {
  id: string;
  user_id: string;
  reading_date: string;
  card_name: string;
  card_arcana: string;
  card_reversed: boolean;
  reading_text: string;
  created_at: string;
}

interface DailyGateState {
  hasRead: boolean;
  reading: DailyReading | null;
  loading: boolean;
  markAsRead: (reading: DailyReading) => Promise<void>;
  refetch: () => Promise<void>;
}

const getTodayKey = () => {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
};

const STORAGE_PREFIX = "angel_daily_gate_";

export function useDailyGate(): DailyGateState {
  const { user, signOut } = useAuthStore();
  const { clearProfile } = useProfileStore();
  const [hasRead, setHasRead] = useState(false);
  const [reading, setReading] = useState<DailyReading | null>(null);
  const [loading, setLoading] = useState(true);

  const checkGate = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const today = getTodayKey();
    const storageKey = `${STORAGE_PREFIX}${user.id}_${today}`;

    try {
      // First check AsyncStorage (fast local check)
      const cached = await AsyncStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached) as DailyReading;
        setReading(parsed);
        setHasRead(true);
        setLoading(false);
        return;
      }

      // Then check Supabase (source of truth)
      const { data, error } = await supabase
        .from("daily_readings")
        .select("*")
        .eq("user_id", user.id)
        .eq("reading_date", today)
        .single();

      if (error) {
        const message = (error.message ?? "").toLowerCase();
        const shouldForceReauth =
          error.code === "PGRST301" ||
          message.includes("jwt") ||
          message.includes("invalid token");

        if (shouldForceReauth) {
          await supabase.auth.signOut();
          clearProfile();
          signOut();
          router.replace("/(auth)/login");
          setHasRead(false);
          setReading(null);
          setLoading(false);
          return;
        }

        // Missing table in local/dev environments should not block auth flow.
        if (error.code === "PGRST205") {
          setHasRead(false);
          setReading(null);
          setLoading(false);
          return;
        }

        if (error.code !== "PGRST116") {
          console.error("useDailyGate Supabase error:", error);
        }
      }

      if (data) {
        // Cache locally for fast access
        await AsyncStorage.setItem(storageKey, JSON.stringify(data));
        setReading(data as DailyReading);
        setHasRead(true);
      } else {
        setHasRead(false);
        setReading(null);
      }
    } catch (err) {
      console.error("useDailyGate error:", err);
    } finally {
      setLoading(false);
    }
  }, [clearProfile, signOut, user]);

  const markAsRead = useCallback(
    async (newReading: DailyReading) => {
      if (!user) return;
      const today = getTodayKey();
      const storageKey = `${STORAGE_PREFIX}${user.id}_${today}`;

      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(newReading));
        setReading(newReading);
        setHasRead(true);
      } catch (err) {
        console.error("markAsRead error:", err);
      }
    },
    [user]
  );

  useEffect(() => {
    checkGate();
  }, [checkGate]);

  return { hasRead, reading, loading, markAsRead, refetch: checkGate };
}
