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
import { ClayTheme, ClayShadows } from "@/constants/clayTheme";

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
            fontSize: 11,
            color: ClayTheme.muted,
            letterSpacing: 1.4,
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
            backgroundColor: ClayTheme.input,
            borderWidth: 1,
            borderColor: focused ? ClayTheme.accent : ClayTheme.inputBorder,
            borderRadius: 20,
            paddingVertical: 16,
            paddingHorizontal: 18,
            color: ClayTheme.text,
            fontFamily: Fonts.body,
            fontSize: 16,
            ...ClayShadows.card,
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
