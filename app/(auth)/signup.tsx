import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { ClayBackdrop } from "@/components/angel/ClayBackdrop";
import { ClayShadows, ClayTheme } from "@/constants/clayTheme";

export default function SignupScreen() {
  useEffect(() => {
    router.replace("/(auth)/login");
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ClayTheme.canvas,
      }}
    >
      <ClayBackdrop />
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: ClayTheme.cardRaised,
          borderWidth: 1,
          borderColor: ClayTheme.border,
          ...ClayShadows.card,
        }}
      >
        <ActivityIndicator size="large" color={ClayTheme.accent} />
      </View>
    </View>
  );
}
