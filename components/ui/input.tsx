import React, { useState, forwardRef } from "react";
import {
  TextInput,
  View,
  Text,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, containerStyle, style, ...props },
  ref
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontFamily: Fonts.bodyBold,
            fontSize: 12,
            color: Colors.textMuted,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        ref={ref}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={Colors.textMuted}
        style={[
          {
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: focused ? Colors.goldBorder : Colors.border,
            borderRadius: 10,
            paddingVertical: 14,
            paddingHorizontal: 16,
            color: Colors.textPrimary,
            fontFamily: Fonts.body,
            fontSize: 15,
          },
          style,
        ]}
        {...props}
      />
      {error && (
        <Text
          style={{
            fontFamily: Fonts.body,
            fontSize: 12,
            color: Colors.error,
            marginTop: 2,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
});
