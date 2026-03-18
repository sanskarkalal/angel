import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MoonBadge } from "@/components/angel/MoonBadge";
import { CardReveal } from "@/components/angel/CardReveal";
import { ReadingText } from "@/components/angel/ReadingText";
import { LoadingOrb } from "@/components/angel/LoadingOrb";
import { useReading } from "@/hooks/useReading";
import { useDailyGate } from "@/hooks/useDailyGate";
import { useProfileStore } from "@/store/profileStore";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "In the quiet hours";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "In the stillness of night";
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useProfileStore();
  const { hasRead, reading: cachedReading, loading: gateLoading, markAsRead } = useDailyGate();
  const readingHook = useReading();
  const [reply, setReply] = useState("");
  const [cardVisible, setCardVisible] = useState(false);
  const cardOpacity = useRef(new RNAnimated.Value(0)).current;
  const contentOpacity = useRef(new RNAnimated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const isLoading = readingHook.loading || gateLoading;
  const showOrb = isLoading && !readingHook.streaming && !readingHook.complete;
  const showContent = readingHook.streaming || readingHook.complete || hasRead;
  const displayText = readingHook.finalText || readingHook.streamingText ||
    (hasRead && cachedReading ? cachedReading.reading_text : "");
  const displayCard = {
    name: readingHook.cardName || (cachedReading?.card_name ?? ""),
    arcana: readingHook.cardArcana || (cachedReading?.card_arcana ?? ""),
    reversed: readingHook.cardReversed || (cachedReading?.card_reversed ?? false),
  };

  // On mount: check gate, trigger reading if not yet read today
  useEffect(() => {
    if (gateLoading) return;

    if (hasRead && cachedReading) {
      // Already read today — show cached immediately
      setCardVisible(true);
      RNAnimated.timing(contentOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } else if (!hasRead) {
      readingHook.startReading();
    }
  }, [gateLoading, hasRead]);

  // When streaming starts, fade in card
  useEffect(() => {
    if (readingHook.cardName && !cardVisible) {
      setCardVisible(true);
      RNAnimated.timing(cardOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [readingHook.cardName]);

  // When reading completes, mark as read
  useEffect(() => {
    if (readingHook.complete && readingHook.readingId && !hasRead) {
      markAsRead({
        id: readingHook.readingId,
        user_id: profile?.user_id ?? "",
        reading_date: new Date().toISOString().split("T")[0],
        card_name: readingHook.cardName,
        card_arcana: readingHook.cardArcana,
        card_reversed: readingHook.cardReversed,
        reading_text: readingHook.finalText,
        created_at: new Date().toISOString(),
      });
    }
  }, [readingHook.complete]);

  // Fade in content when text starts streaming
  useEffect(() => {
    if (readingHook.streamingText) {
      RNAnimated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [readingHook.streamingText]);

  async function handleSendReply() {
    if (!reply.trim()) return;
    const message = reply.trim();
    setReply("");
    await readingHook.sendReply(message, cachedReading?.id ?? undefined);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.night }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 80,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ gap: 4 }}>
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 13,
                color: Colors.textMuted,
                letterSpacing: 0.5,
              }}
            >
              {getGreeting()}{profile?.name ? `, ${profile.name}` : ""}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.display,
                fontSize: 20,
                color: Colors.textPrimary,
                letterSpacing: 1.5,
              }}
            >
              Your Reading
            </Text>
          </View>
          <MoonBadge />
        </View>

        {/* Loading orb */}
        {showOrb && (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 60 }}>
            <LoadingOrb />
          </View>
        )}

        {/* Error state */}
        {readingHook.error && (
          <View style={{ alignItems: "center", gap: 16, paddingVertical: 32 }}>
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 15,
                color: Colors.textSecondary,
                textAlign: "center",
                lineHeight: 24,
                fontStyle: "italic",
              }}
            >
              Something interrupted our connection.{"\n"}Shall we try again?
            </Text>
            <Button variant="ghost" onPress={() => {
              readingHook.retry();
              readingHook.startReading();
            }}>
              Try again
            </Button>
          </View>
        )}

        {/* Card + Reading */}
        {showContent && (
          <RNAnimated.View style={{ opacity: contentOpacity, gap: 28 }}>
            {/* Card reveal */}
            {cardVisible && (
              <View style={{ alignItems: "center" }}>
                {hasRead && cachedReading ? (
                  // Already read — show face-up directly
                  <View style={{ alignItems: "center", gap: 12 }}>
                    <CardReveal
                      cardName={displayCard.name}
                      arcana={displayCard.arcana}
                      reversed={displayCard.reversed}
                    />
                    <Text
                      style={{
                        fontFamily: Fonts.body,
                        fontSize: 11,
                        color: Colors.textMuted,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                      }}
                    >
                      Today's card
                    </Text>
                  </View>
                ) : (
                  <View style={{ alignItems: "center", gap: 12 }}>
                    <CardReveal
                      cardName={displayCard.name}
                      arcana={displayCard.arcana}
                      reversed={displayCard.reversed}
                    />
                    <Text
                      style={{
                        fontFamily: Fonts.body,
                        fontSize: 11,
                        color: Colors.textMuted,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                      }}
                    >
                      Today's card
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Reading text */}
            {displayText ? (
              <View
                style={{
                  backgroundColor: Colors.goldSurface,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: Colors.goldBorder,
                }}
              >
                <ReadingText
                  text={displayText}
                  isStreaming={readingHook.streaming}
                />
              </View>
            ) : null}

            {/* Conversation history */}
            {readingHook.conversation.length > 0 && (
              <View style={{ gap: 14 }}>
                <Separator gold />
                {readingHook.conversation.map((msg, index) => (
                  <View
                    key={index}
                    style={{
                      alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <View
                      style={{
                        maxWidth: "85%",
                        backgroundColor:
                          msg.role === "user" ? Colors.surface2 : Colors.goldSurface,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor:
                          msg.role === "user" ? Colors.border : Colors.goldBorder,
                        padding: 14,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily:
                            msg.role === "angel" ? Fonts.body : Fonts.body,
                          fontSize: 14,
                          color:
                            msg.role === "angel"
                              ? Colors.textPrimary
                              : Colors.textSecondary,
                          lineHeight: 22,
                          fontStyle: msg.role === "angel" ? "italic" : "normal",
                        }}
                      >
                        {msg.content}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Loading reply */}
                {readingHook.loading && (
                  <View style={{ alignItems: "flex-start" }}>
                    <View
                      style={{
                        backgroundColor: Colors.goldSurface,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: Colors.goldBorder,
                        padding: 14,
                        flexDirection: "row",
                        gap: 4,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: Colors.gold, fontSize: 18 }}>···</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </RNAnimated.View>
        )}
      </ScrollView>

      {/* Reply input — only show when reading is complete */}
      {(readingHook.complete || hasRead) && (
        <View
          style={{
            padding: 16,
            paddingBottom: insets.bottom + 8,
            backgroundColor: Colors.night,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          <TextInput
            value={reply}
            onChangeText={setReply}
            placeholder="Reply to Angel..."
            placeholderTextColor={Colors.textMuted}
            multiline
            style={{
              flex: 1,
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 20,
              paddingVertical: 10,
              paddingHorizontal: 16,
              color: Colors.textPrimary,
              fontFamily: Fonts.body,
              fontSize: 14,
              maxHeight: 100,
            }}
          />
          <Pressable
            onPress={handleSendReply}
            disabled={!reply.trim() || readingHook.loading}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: reply.trim() ? Colors.gold : Colors.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="arrow-up"
              size={18}
              color={reply.trim() ? Colors.night : Colors.textMuted}
            />
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
