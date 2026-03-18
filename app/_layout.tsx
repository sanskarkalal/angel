import "../global.css";

import React, { useEffect } from "react";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import {
  useFonts,
  Cinzel_500Medium,
} from "@expo-google-fonts/cinzel";
import {
  Lato_300Light,
  Lato_700Bold,
  Lato_300Light_Italic,
  Lato_700Bold_Italic,
} from "@expo-google-fonts/lato";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { useProfileStore } from "@/store/profileStore";
import { Colors } from "@/constants/colors";

function RootLayoutContent() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfileStore();
  const segments = useSegments();
  const inOnboarding = segments[0] === "onboarding";

  const isLoading = authLoading || (!!user && profileLoading);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/(auth)/login");
      return;
    }

    if (profile && !profile.onboarding_complete) {
      if (!inOnboarding) {
        router.replace("/onboarding/step1-name");
      }
      return;
    }

    if (profile && profile.onboarding_complete) {
      router.replace("/(tabs)");
      return;
    }

    // Profile not yet created — go to onboarding
    if (user && profile === null && !profileLoading) {
      if (!inOnboarding) {
        router.replace("/onboarding/step1-name");
      }
    }
  }, [inOnboarding, isLoading, user, profile, profileLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.night,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Cinzel_500Medium,
    Lato_300Light,
    Lato_700Bold,
    Lato_300Light_Italic,
    Lato_700Bold_Italic,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.night,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.night }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={Colors.night} />
        <RootLayoutContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
