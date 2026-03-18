import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { ClayTheme } from "@/constants/clayTheme";

export function ClayBackdrop() {
  const driftA = useRef(new Animated.Value(0)).current;
  const driftB = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(driftA, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(driftA, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(driftB, {
          toValue: 1,
          duration: 11000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(driftB, {
          toValue: 0,
          duration: 11000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [driftA, driftB]);

  const blobAStyle = {
    transform: [
      {
        translateY: driftA.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -18],
        }),
      },
    ],
  };

  const blobBStyle = {
    transform: [
      {
        translateY: driftB.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -24],
        }),
      },
    ],
  };

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: 999,
            backgroundColor: "rgba(124,58,237,0.20)",
            top: -40,
            left: -70,
          },
          blobAStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: 999,
            backgroundColor: "rgba(219,39,119,0.14)",
            top: 150,
            right: -85,
          },
          blobBStyle,
        ]}
      />
      <View
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: "rgba(168,139,250,0.12)",
          bottom: -70,
          left: 40,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: ClayTheme.canvas,
          opacity: 0.8,
        }}
      />
    </View>
  );
}
