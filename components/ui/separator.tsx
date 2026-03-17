import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";

interface SeparatorProps {
  style?: StyleProp<ViewStyle>;
  gold?: boolean;
  vertical?: boolean;
}

export function Separator({ style, gold = false, vertical = false }: SeparatorProps) {
  return (
    <View
      style={[
        {
          backgroundColor: gold ? Colors.goldBorder : Colors.border,
        },
        vertical
          ? { width: 1, height: "100%" }
          : { height: 1, width: "100%" },
        style,
      ]}
    />
  );
}
