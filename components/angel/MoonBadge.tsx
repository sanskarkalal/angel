import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { getMoonPhase } from "@/lib/moonphase";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

interface MoonBadgeProps {
  date?: Date;
}

export function MoonBadge({ date }: MoonBadgeProps) {
  const phase = useMemo(() => getMoonPhase(date ?? new Date()), [date]);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 5,
        paddingHorizontal: 12,
        backgroundColor: Colors.goldSurface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.goldBorder,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ fontSize: 13 }}>{phase.emoji}</Text>
      <Text
        style={{
          fontFamily: Fonts.bodyBold,
          fontSize: 11,
          color: Colors.gold,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {phase.name}
      </Text>
    </View>
  );
}
