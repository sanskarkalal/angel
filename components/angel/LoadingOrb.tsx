import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

export function LoadingOrb() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const innerScale = useSharedValue(0.8);
  const ringOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.6);

  useEffect(() => {
    // Pulsing core
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1800, easing: Easing.bezier(0.45, 0, 0.55, 1) }),
        withTiming(1, { duration: 1800, easing: Easing.bezier(0.45, 0, 0.55, 1) })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.ease }),
        withTiming(0.6, { duration: 1800, easing: Easing.ease })
      ),
      -1,
      false
    );

    // Inner glow
    innerScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.ease }),
        withTiming(0.75, { duration: 1400, easing: Easing.ease })
      ),
      -1,
      false
    );

    // Expanding ring
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 400 }),
        withTiming(0, { duration: 1800 })
      ),
      -1,
      false
    );

    ringScale.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 200 }),
        withTiming(1.8, { duration: 2000, easing: Easing.out(Easing.quad) })
      ),
      -1,
      false
    );
  }, []);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: 20 }}>
      <View style={{ width: 100, height: 100, alignItems: "center", justifyContent: "center" }}>
        {/* Expanding ring */}
        <Animated.View
          style={[
            ringStyle,
            {
              position: "absolute",
              width: 100,
              height: 100,
              borderRadius: 50,
              borderWidth: 1,
              borderColor: Colors.gold,
            },
          ]}
        />

        {/* Outer orb */}
        <Animated.View
          style={[
            outerStyle,
            {
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: Colors.goldSurface,
              borderWidth: 1,
              borderColor: Colors.goldBorder,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          {/* Inner glow */}
          <Animated.View
            style={[
              innerStyle,
              {
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: `rgba(201,168,76,0.25)`,
              },
            ]}
          />
        </Animated.View>
      </View>

      <Text
        style={{
          fontFamily: Fonts.body,
          fontSize: 13,
          color: Colors.textMuted,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        Angel is present...
      </Text>
    </View>
  );
}
