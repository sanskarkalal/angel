import { useState, useCallback, useRef } from "react";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { supabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api";

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
  sendReply: (message: string, readingIdOverride?: string) => Promise<void>;
  hydrateConversation: (readingId: string) => Promise<boolean>;
  retry: () => void;
}

const API_URL = getApiUrl();

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
  const readingRequestInFlightRef = useRef(false);

  const startReading = useCallback(async () => {
    if (readingRequestInFlightRef.current) return;
    if (!session?.access_token) {
      setState((s) => ({ ...s, error: "Not authenticated", loading: false }));
      return;
    }
    readingRequestInFlightRef.current = true;

    setState((s) => ({
      ...s,
      loading: true,
      error: null,
      streamingText: "",
      finalText: "",
      streaming: false,
      complete: false,
      conversation: [],
      readingId: null,
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
          const data = await response.json() as {
            cached?: boolean;
            retryAfterSec?: number;
            error?: string;
            reading?: {
              id: string;
              card_name: string;
              card_arcana: string;
              card_reversed: boolean;
              reading_text: string;
            }
          };

          if (data.cached && data.reading) {
            const reading = data.reading;
            setState((s) => ({
              ...s,
              loading: false,
              complete: true,
              finalText: reading.reading_text,
              streamingText: reading.reading_text,
              cardName: reading.card_name,
              cardArcana: reading.card_arcana,
              cardReversed: reading.card_reversed,
              readingId: reading.id,
            }));
            return;
          }

          const waitText =
            data.retryAfterSec && data.retryAfterSec > 0
              ? ` Please try again in ${data.retryAfterSec}s.`
              : "";
          throw new Error((data.error ?? "Please try again in a moment.") + waitText);
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
            retryAfterSec?: number;
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
            const waitText =
              parsed.retryAfterSec && parsed.retryAfterSec > 0
                ? ` Please try again in ${parsed.retryAfterSec}s.`
                : "";
            setState((s) => ({
              ...s,
              loading: false,
              streaming: false,
              error: (parsed.message ?? "The connection wavered.") + waitText,
            }));
            return true;
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
      let sseBuffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        sseBuffer += chunk;
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop() ?? "";
        let shouldStop = false;
        for (const line of lines) {
          shouldStop = processSseLine(line);
          if (shouldStop) break;
        }
        if (shouldStop) break;
      }

      if (sseBuffer.trim().length > 0) {
        processSseLine(sseBuffer);
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
    } finally {
      readingRequestInFlightRef.current = false;
    }
  }, [clearProfile, session, signOut]);

  const sendReply = useCallback(
    async (message: string, readingIdOverride?: string) => {
      const activeReadingId = readingIdOverride ?? state.readingId;
      if (!session?.access_token || !activeReadingId) {
        setState((s) => ({
          ...s,
          error: "I lost the thread of this reading. Pull to refresh and try again.",
        }));
        return;
      }

      const userMessage: Message = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      const nextHistory = [...state.conversation, userMessage];

      setState((s) => ({
        ...s,
        conversation: nextHistory,
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
            readingId: activeReadingId,
            history: nextHistory,
          }),
        });

        if (response.status === 401) {
          await supabase.auth.signOut();
          clearProfile();
          signOut();
          router.replace("/(auth)/login");
          throw new Error("Session expired. Please log in again.");
        }

        if (!response.ok) {
          let message = `Chat error: ${response.status}`;
          try {
            const errorData = await response.json() as {
              error?: string;
              retryAfterSec?: number;
            };
            const waitText =
              errorData.retryAfterSec && errorData.retryAfterSec > 0
                ? ` Please try again in ${errorData.retryAfterSec}s.`
                : "";
            message = (errorData.error ?? message) + waitText;
          } catch {
            // Ignore parsing failure and keep status-based message.
          }
          throw new Error(message);
        }

        const data = await response.json() as {
          reply: string;
          messages?: Array<Message>;
        };
        const angelMessage: Message = {
          role: "angel",
          content: data.reply,
          timestamp: new Date().toISOString(),
        };

        setState((s) => ({
          ...s,
          conversation: data.messages && data.messages.length > 0
            ? data.messages
            : [...s.conversation, angelMessage],
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

  const hydrateConversation = useCallback(
    async (readingId: string) => {
      if (!session?.access_token || !readingId) return false;

      try {
        const response = await fetch(
          `${API_URL}/api/chat/history?readingId=${encodeURIComponent(readingId)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          return false;
        }

        const data = await response.json() as { messages?: Array<Message> };
        setState((s) => ({
          ...s,
          conversation: data.messages ?? [],
        }));
        return true;
      } catch (err) {
        console.error("hydrateConversation error:", err);
        return false;
      }
    },
    [session]
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

  return { ...state, startReading, sendReply, hydrateConversation, retry };
}
