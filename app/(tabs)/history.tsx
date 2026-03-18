import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useAuthStore } from "@/store/authStore";
import { getApiUrl } from "@/lib/api";

type ArchiveItem = {
  readingId: string;
  readingDate: string;
  cardName: string;
  cardArcana: string;
  cardReversed: boolean;
  readingPreview: string;
  messageCount: number;
  summary: string;
  lastMessageAt: string | null;
};

type ArchiveDetail = {
  reading: {
    id: string;
    readingDate: string;
    cardName: string;
    cardArcana: string;
    cardReversed: boolean;
    readingText: string;
  };
  summary: string;
  messages: Array<{ role: string; content: string; timestamp?: string }>;
};

const API_URL = getApiUrl();

function formatDate(dateInput: string): string {
  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) return dateInput;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallSummary, setOverallSummary] = useState("No past readings yet.");
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [activeDetail, setActiveDetail] = useState<ArchiveDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const canLoad = useMemo(() => Boolean(session?.access_token), [session?.access_token]);

  const loadArchive = useCallback(async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/chat/archive`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to load archive (${response.status})`);
      }
      const data = (await response.json()) as {
        overallSummary?: string;
        items?: ArchiveItem[];
      };
      setOverallSummary(data.overallSummary ?? "No past readings yet.");
      setItems(data.items ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load history.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (!canLoad) return;
    void loadArchive();
  }, [canLoad, loadArchive]);

  async function openDetail(readingId: string) {
    if (!session?.access_token) return;
    setDetailLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/chat/archive/${encodeURIComponent(readingId)}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to load chat (${response.status})`);
      }
      const data = (await response.json()) as ArchiveDetail;
      setActiveDetail(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to open chat.";
      setError(message);
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.night,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 30,
          gap: 12,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.display,
            fontSize: 22,
            color: Colors.gold,
            letterSpacing: 2.2,
            textAlign: "center",
          }}
        >
          HISTORY
        </Text>

        <View
          style={{
            backgroundColor: Colors.goldSurface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: Colors.goldBorder,
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 6,
          }}
        >
          <Text style={{ color: Colors.gold, fontFamily: Fonts.bodyBold, fontSize: 12 }}>
            Combined Summary
          </Text>
          <Text
            style={{
              color: Colors.textSecondary,
              fontFamily: Fonts.body,
              lineHeight: 20,
              fontSize: 13,
            }}
          >
            {overallSummary}
          </Text>
        </View>

        {loading ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 28 }}>
            <ActivityIndicator size="large" color={Colors.gold} />
          </View>
        ) : null}

        {!loading && error ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 12,
              padding: 12,
              backgroundColor: Colors.surface,
              gap: 8,
            }}
          >
            <Text style={{ color: Colors.error, fontFamily: Fonts.body, fontSize: 13 }}>
              {error}
            </Text>
            <Pressable
              onPress={() => void loadArchive()}
              style={{
                alignSelf: "flex-start",
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: Colors.goldBorder,
                backgroundColor: Colors.goldSurface,
              }}
            >
              <Text style={{ color: Colors.gold, fontFamily: Fonts.bodyBold, fontSize: 12 }}>
                Retry
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <Text
            style={{
              color: Colors.textMuted,
              textAlign: "center",
              paddingVertical: 22,
              fontFamily: Fonts.body,
            }}
          >
            No archived chats yet.
          </Text>
        ) : null}

        {!loading &&
          !error &&
          items.map((item) => (
            <Pressable
              key={item.readingId}
              onPress={() => void openDetail(item.readingId)}
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: Colors.surface,
                gap: 6,
              }}
            >
              <Text style={{ color: Colors.gold, fontFamily: Fonts.bodyBold, fontSize: 12 }}>
                {formatDate(item.readingDate)} - {item.cardName}
              </Text>
              <Text
                style={{
                  color: Colors.textSecondary,
                  fontFamily: Fonts.body,
                  fontSize: 13,
                  lineHeight: 20,
                }}
              >
                {item.summary}
              </Text>
              <Text
                style={{
                  color: Colors.textMuted,
                  fontFamily: Fonts.body,
                  fontSize: 12,
                  lineHeight: 18,
                }}
              >
                {item.readingPreview}
              </Text>
            </Pressable>
          ))}
      </ScrollView>

      <Modal visible={Boolean(activeDetail)} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              maxHeight: "84%",
              backgroundColor: Colors.night100,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              borderWidth: 1,
              borderColor: Colors.border,
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: Math.max(insets.bottom, 16),
              gap: 10,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: Colors.gold, fontFamily: Fonts.display, fontSize: 18, letterSpacing: 1 }}>
                {activeDetail ? activeDetail.reading.cardName : "Reading"}
              </Text>
              <Pressable
                onPress={() => setActiveDetail(null)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
              >
                <Text style={{ color: Colors.textSecondary, fontFamily: Fonts.body, fontSize: 12 }}>
                  Close
                </Text>
              </Pressable>
            </View>

            {detailLoading ? (
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={Colors.gold} />
              </View>
            ) : null}

            {activeDetail ? (
              <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 12 }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.goldBorder,
                    borderRadius: 12,
                    padding: 10,
                    backgroundColor: Colors.goldSurface,
                  }}
                >
                  <Text style={{ color: Colors.gold, fontFamily: Fonts.bodyBold, fontSize: 12 }}>
                    Summary
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      color: Colors.textSecondary,
                      fontFamily: Fonts.body,
                      fontSize: 13,
                      lineHeight: 20,
                    }}
                  >
                    {activeDetail.summary}
                  </Text>
                </View>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.border,
                    borderRadius: 12,
                    padding: 10,
                    backgroundColor: Colors.surface,
                  }}
                >
                  <Text style={{ color: Colors.gold, fontFamily: Fonts.bodyBold, fontSize: 12 }}>
                    Reading
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      color: Colors.textSecondary,
                      fontFamily: Fonts.body,
                      fontSize: 13,
                      lineHeight: 20,
                    }}
                  >
                    {activeDetail.reading.readingText}
                  </Text>
                </View>

                {activeDetail.messages.map((msg, idx) => (
                  <View
                    key={`${idx}-${msg.timestamp ?? ""}`}
                    style={{
                      alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "90%",
                      borderWidth: 1,
                      borderColor: msg.role === "user" ? Colors.border : Colors.goldBorder,
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      backgroundColor: msg.role === "user" ? Colors.surface2 : Colors.goldSurface,
                    }}
                  >
                    <Text
                      style={{
                        color: msg.role === "user" ? Colors.textPrimary : Colors.textSecondary,
                        fontFamily: Fonts.body,
                        fontSize: 13,
                        lineHeight: 19,
                      }}
                    >
                      {msg.content}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
