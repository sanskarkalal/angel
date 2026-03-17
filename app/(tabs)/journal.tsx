import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

export default function JournalScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.night,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        gap: 12,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.display,
          fontSize: 22,
          color: Colors.gold,
          letterSpacing: 3,
          textAlign: "center",
        }}
      >
        JOURNAL
      </Text>
      <Text
        style={{
          fontFamily: Fonts.body,
          fontSize: 14,
          color: Colors.textMuted,
          textAlign: "center",
          letterSpacing: 1,
        }}
      >
        Coming in Phase 2
      </Text>
      <View
        style={{
          marginTop: 8,
          paddingHorizontal: 20,
          paddingVertical: 10,
          backgroundColor: Colors.goldSurface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: Colors.goldBorder,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.body,
            fontSize: 13,
            color: Colors.textSecondary,
            textAlign: "center",
            lineHeight: 20,
            fontStyle: "italic",
          }}
        >
          "Your words are sacred.{"\n"}I am preparing a space to hold them."
        </Text>
      </View>
    </View>
  );
}
