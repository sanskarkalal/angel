import React from "react";
import {
  View,
  type ViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Colors } from "@/constants/colors";

interface CardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  goldBorder?: boolean;
  children: React.ReactNode;
}

export function Card({ style, goldBorder = false, children, ...props }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: goldBorder ? Colors.goldBorder : Colors.border,
          borderRadius: 16,
          padding: 16,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
