import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { ClayShadows, ClayTheme } from "@/constants/clayTheme";

type ButtonVariant = "primary" | "ghost" | "text" | "clayPrimary";

interface ButtonProps extends Omit<PressableProps, "style"> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  loading = false,
  children,
  style,
  textStyle,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyles: StyleProp<ViewStyle> = [
    {
      borderRadius: 20,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      opacity: isDisabled ? 0.5 : 1,
      backgroundColor: ClayTheme.cardRaised,
      shadowColor: "#090512",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 14,
      elevation: 10,
    },
    fullWidth && { width: "100%" },
    variant === "primary" && {
      backgroundColor: Colors.gold,
    },
    variant === "clayPrimary" && {
      backgroundColor: "#F9F4F0",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.85)",
      borderRadius: 20,
      minHeight: 58,
      shadowColor: "#090512",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.46,
      shadowRadius: 18,
      elevation: 14,
    },
    variant === "ghost" && {
      backgroundColor: "rgba(255,255,255,0.10)",
      borderWidth: 1,
      borderColor: Colors.goldBorder,
    },
    variant === "text" && {
      backgroundColor: "rgba(167,139,250,0.14)",
      borderWidth: 1,
      borderColor: "rgba(167,139,250,0.28)",
      paddingHorizontal: 16,
    },
    style as ViewStyle,
  ];

  const labelStyles: StyleProp<TextStyle> = [
    {
      fontFamily: Fonts.bodyBold,
      fontSize: 15,
      letterSpacing: 0.5,
    },
    variant === "primary" && {
      color: Colors.night,
    },
    variant === "clayPrimary" && {
      color: ClayTheme.darkText,
      fontSize: 16,
      letterSpacing: 0.25,
    },
    (variant === "ghost" || variant === "text") && {
      color: Colors.gold,
    },
    textStyle as TextStyle,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        ...containerStyles.filter(Boolean),
        pressed && !isDisabled && { opacity: 0.8 },
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "primary" || variant === "clayPrimary"
              ? Colors.night
              : Colors.gold
          }
        />
      ) : (
        <Text style={labelStyles}>{children}</Text>
      )}
    </Pressable>
  );
}
