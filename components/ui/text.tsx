import React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

type TextVariant = "display" | "title" | "body" | "caption" | "muted" | "gold";

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  children: React.ReactNode;
}

const variantStyles: Record<TextVariant, object> = {
  display: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.gold,
    letterSpacing: 2,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 20,
    color: Colors.textPrimary,
    letterSpacing: 1.5,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  caption: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  muted: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  gold: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.gold,
    letterSpacing: 0.5,
  },
};

export function Text({ variant = "body", style, children, ...props }: TextProps) {
  return (
    <RNText style={[variantStyles[variant], style]} {...props}>
      {children}
    </RNText>
  );
}
