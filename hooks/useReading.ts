import { useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";

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
  const { session } = useAuthStore();
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

      // Parse SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullText = "";
      let cardName = "";
      let cardArcana = "";
      let cardReversed = false;
      let readingId = "";
      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();

            if (data === "[DONE]") {
              setState((s) => ({
                ...s,
                streaming: false,
                complete: true,
                finalText: fullText,
                loading: false,
              }));
              break;
            }

            try {
              const parsed = JSON.parse(data) as {
                type?: string;
                text?: string;
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

                if (firstChunk) {
                  firstChunk = false;
                }

                setState((s) => ({
                  ...s,
                  streamingText: fullText,
                  loading: false,
                  streaming: true,
                }));
              }
            } catch {
              // Non-JSON data line, skip
            }
          }
        }
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
  }, [session]);

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
    [session, state.readingId, state.conversation]
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
