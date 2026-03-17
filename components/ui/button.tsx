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

type ButtonVariant = "primary" | "ghost" | "text";

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
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      opacity: isDisabled ? 0.5 : 1,
    },
    fullWidth && { width: "100%" },
    variant === "primary" && {
      backgroundColor: Colors.gold,
    },
    variant === "ghost" && {
      backgroundColor: Colors.transparent,
      borderWidth: 1,
      borderColor: Colors.goldBorder,
    },
    variant === "text" && {
      backgroundColor: Colors.transparent,
      paddingHorizontal: 8,
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
          color={variant === "primary" ? Colors.night : Colors.gold}
        />
      ) : (
        <Text style={labelStyles}>{children}</Text>
      )}
    </Pressable>
  );
}
