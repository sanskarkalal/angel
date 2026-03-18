import React from "react";
import { View, Text } from "react-native";
import { Fonts } from "@/constants/fonts";
import { ClayShadows, ClayTheme } from "@/constants/clayTheme";

interface AngelMessageProps {
  message: string;
  animated?: boolean;
}

export function AngelMessage({ message }: AngelMessageProps) {
  return (
    <View
      style={{
        backgroundColor: ClayTheme.cardRaised,
        borderWidth: 1,
        borderColor: ClayTheme.border,
        borderRadius: 24,
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginVertical: 4,
        ...ClayShadows.card,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.body,
          fontSize: 14,
          color: ClayTheme.muted,
          lineHeight: 22,
          fontStyle: "italic",
          letterSpacing: 0.2,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
