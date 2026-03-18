import React from "react";
import { View, Text } from "react-native";
import { Fonts } from "@/constants/fonts";
import { ClayTheme } from "@/constants/clayTheme";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = currentStep / totalSteps;

  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          height: 6,
          backgroundColor: "rgba(255,255,255,0.12)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            backgroundColor: ClayTheme.accent,
            borderRadius: 999,
          }}
        />
      </View>
      <Text
        style={{
          fontFamily: Fonts.bodyBold,
          fontSize: 11,
          color: ClayTheme.muted,
          letterSpacing: 1.3,
          textTransform: "uppercase",
          textAlign: "right",
        }}
      >
        {currentStep} of {totalSteps}
      </Text>
    </View>
  );
}
