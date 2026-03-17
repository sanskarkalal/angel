import React from "react";
import { View, Text } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

interface AngelMessageProps {
  message: string;
  animated?: boolean;
}

export function AngelMessage({ message }: AngelMessageProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.goldSurface,
        borderLeftWidth: 2,
        borderLeftColor: Colors.gold,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 4,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.body,
          fontSize: 14,
          color: Colors.textSecondary,
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
