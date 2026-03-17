import React from "react";
import { View, Text } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

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
          height: 2,
          backgroundColor: Colors.surface2,
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            backgroundColor: Colors.gold,
            borderRadius: 1,
          }}
        />
      </View>
      <Text
        style={{
          fontFamily: Fonts.bodyBold,
          fontSize: 11,
          color: Colors.textMuted,
          letterSpacing: 1,
          textTransform: "uppercase",
          textAlign: "right",
        }}
      >
        {currentStep} of {totalSteps}
      </Text>
    </View>
  );
}
