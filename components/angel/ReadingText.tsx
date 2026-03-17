import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

interface ReadingTextProps {
  text: string;
  isStreaming: boolean;
}

function StreamingCursor() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0, { duration: 530, easing: Easing.ease }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          width: 2,
          height: 18,
          backgroundColor: Colors.gold,
          borderRadius: 1,
          marginLeft: 2,
          alignSelf: "center",
          display: "inline-flex" as never,
        },
      ]}
    />
  );
}

export function ReadingText({ text, isStreaming }: ReadingTextProps) {
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start" }}>
        <Text
          style={{
            fontFamily: Fonts.body,
            fontSize: 16,
            color: Colors.textPrimary,
            lineHeight: 26,
            letterSpacing: 0.3,
          }}
        >
          {text}
        </Text>
        {isStreaming && <StreamingCursor />}
      </View>
    </View>
  );
}
