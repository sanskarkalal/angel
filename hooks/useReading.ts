import { useState, useCallback } from "react";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { supabase } from "@/lib/supabase";

interface Message {
  role: "angel" | "user";
  content: string;
  timestamp: string;
}

interface ReadingState {
  loading: boolean;
  streaming: boolean;
  complete: boolean;
  error: string | null;
  streamingText: string;
  finalText: string;
  cardName: string;
  cardArcana: string;
  cardReversed: boolean;
  conversation: Message[];
  readingId: string | null;
}

interface UseReadingReturn extends ReadingState {
  startReading: () => Promise<void>;
  sendReply: (message: string) => Promise<void>;
  retry: () => void;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export function useReading(): UseReadingReturn {
  const { session, signOut } = useAuthStore();
  const { clearProfile } = useProfileStore();
  const [state, setState] = useState<ReadingState>({
    loading: false,
    streaming: false,
    complete: false,
    error: null,
    streamingText: "",
    finalText: "",
    cardName: "",
    cardArcana: "",
    cardReversed: false,
    conversation: [],
    readingId: null,
  });

  const startReading = useCallback(async () => {
    if (!session?.access_token) {
      setState((s) => ({ ...s, error: "Not authenticated", loading: false }));
      return;
    }

    setState((s) => ({
      ...s,
      loading: true,
      error: null,
      streamingText: "",
      finalText: "",
      streaming: false,
      complete: false,
    }));

    try {
      const response = await fetch(`${API_URL}/api/reading`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await supabase.auth.signOut();
          clearProfile();
          signOut();
          router.replace("/(auth)/login");
          throw new Error("Session expired. Please log in again.");
        }

        if (response.status === 429) {
          // Cached reading returned
          const data = await response.json() as {
            cached: boolean;
            reading: {
              id: string;
              card_name: string;
              card_arcana: string;
              card_reversed: boolean;
              reading_text: string;
            }
          };
          setState((s) => ({
            ...s,
            loading: false,
            complete: true,
            finalText: data.reading.reading_text,
            streamingText: data.reading.reading_text,
            cardName: data.reading.card_name,
            cardArcana: data.reading.card_arcana,
            cardReversed: data.reading.card_reversed,
            readingId: data.reading.id,
          }));
          return;
        }
        throw new Error(`Server error: ${response.status}`);
      }

      let fullText = "";
      let cardName = "";
      let cardArcana = "";
      let cardReversed = false;
      let readingId = "";
      const processSseLine = (line: string) => {
        if (!line.startsWith("data: ")) return false;
        const data = line.slice(6).trim();

        if (data === "[DONE]") {
          setState((s) => ({
            ...s,
            streaming: false,
            complete: true,
            finalText: fullText,
            loading: false,
          }));
          return true;
        }

        try {
          const parsed = JSON.parse(data) as {
            type?: string;
            text?: string;
            message?: string;
            card?: {
              name: string;
              arcana: string;
              reversed: boolean;
            };
            readingId?: string;
          };

          if (parsed.type === "card") {
            cardName = parsed.card?.name ?? "";
            cardArcana = parsed.card?.arcana ?? "";
            cardReversed = parsed.card?.reversed ?? false;
            readingId = parsed.readingId ?? "";

            setState((s) => ({
              ...s,
              cardName,
              cardArcana,
              cardReversed,
              readingId,
              loading: false,
              streaming: true,
            }));
          } else if (parsed.type === "text" && parsed.text) {
            fullText += parsed.text;
            setState((s) => ({
              ...s,
              streamingText: fullText,
              loading: false,
              streaming: true,
            }));
          } else if (parsed.type === "done") {
            if (parsed.readingId) readingId = parsed.readingId;
          } else if (parsed.type === "error") {
            throw new Error(parsed.message ?? "The connection wavered.");
          }
        } catch (err) {
          if (err instanceof Error) {
            throw err;
          }
        }

        return false;
      };

      // RN fetch can return null body in some environments (notably Expo Go/iOS).
      // Fall back to buffered text parsing when streams are unavailable.
      const reader = response.body?.getReader();
      if (!reader) {
        const sseText = await response.text();
        const lines = sseText.split("\n");
        let done = false;
        for (const line of lines) {
          done = processSseLine(line);
          if (done) break;
        }
        if (!done) {
          setState((s) => ({
            ...s,
            loading: false,
            streaming: false,
            complete: true,
            finalText: fullText,
          }));
        }
        return;
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        let shouldStop = false;
        for (const line of lines) {
          shouldStop = processSseLine(line);
          if (shouldStop) break;
        }
        if (shouldStop) break;
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Connection interrupted";
      console.error("startReading error:", err);
      setState((s) => ({
        ...s,
        loading: false,
        streaming: false,
        error: message,
      }));
    }
  }, [clearProfile, session, signOut]);

  const sendReply = useCallback(
    async (message: string) => {
      if (!session?.access_token || !state.readingId) return;

      const userMessage: Message = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };

      setState((s) => ({
        ...s,
        conversation: [...s.conversation, userMessage],
        loading: true,
        error: null,
      }));

      try {
        const response = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message,
            readingId: state.readingId,
            history: state.conversation,
          }),
        });

        if (response.status === 401) {
          await supabase.auth.signOut();
          clearProfile();
          signOut();
          router.replace("/(auth)/login");
          throw new Error("Session expired. Please log in again.");
        }

        if (!response.ok) throw new Error(`Chat error: ${response.status}`);

        const data = await response.json() as { reply: string };
        const angelMessage: Message = {
          role: "angel",
          content: data.reply,
          timestamp: new Date().toISOString(),
        };

        setState((s) => ({
          ...s,
          conversation: [...s.conversation, angelMessage],
          loading: false,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send message";
        console.error("sendReply error:", err);
        setState((s) => ({
          ...s,
          loading: false,
          error: message,
        }));
      }
    },
    [clearProfile, session, signOut, state.readingId, state.conversation]
  );

  const retry = useCallback(() => {
    setState((s) => ({
      ...s,
      error: null,
      loading: false,
      streaming: false,
      complete: false,
      streamingText: "",
      finalText: "",
    }));
  }, []);

  return { ...state, startReading, sendReply, retry };
}
