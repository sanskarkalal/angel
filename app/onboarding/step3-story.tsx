import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/angel/ProgressBar";
import { ClayBackdrop } from "@/components/angel/ClayBackdrop";
import { useOnboardingStore } from "@/store/onboardingStore";
import { Fonts } from "@/constants/fonts";
import { ClayShadows, ClayTheme } from "@/constants/clayTheme";

export default function Step3Story() {
  const { data, setData } = useOnboardingStore();
  const [story, setStory] = useState(data.onboarding_story ?? "");

  function handleNext() {
    setData({ onboarding_story: story.trim() });
    router.push("/onboarding/step4-intentions");
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: ClayTheme.canvas }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ClayBackdrop />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20, gap: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            borderRadius: 34,
            backgroundColor: ClayTheme.card,
            borderWidth: 1,
            borderColor: ClayTheme.border,
            padding: 20,
            ...ClayShadows.card,
          }}
        >
          <ProgressBar currentStep={3} totalSteps={5} />

          <View style={{ gap: 24, marginTop: 14 }}>
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontFamily: Fonts.display,
                fontSize: 24,
                color: ClayTheme.text,
                letterSpacing: 0.8,
                lineHeight: 34,
              }}
            >
              What are you moving through right now?
            </Text>
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 15,
                color: ClayTheme.muted,
                lineHeight: 24,
                fontStyle: "italic",
              }}
            >
              Tell me anything. This space is sacred and yours alone.
            </Text>
          </View>

          <TextInput
            value={story}
            onChangeText={setStory}
            placeholder="Whatever is on your heart right now..."
            placeholderTextColor={ClayTheme.muted}
            multiline
            textAlignVertical="top"
            style={{
              backgroundColor: ClayTheme.input,
              borderWidth: 1,
              borderColor: ClayTheme.inputBorder,
              borderRadius: 24,
              padding: 18,
              color: ClayTheme.text,
              fontFamily: Fonts.body,
              fontSize: 16,
              lineHeight: 24,
              minHeight: 180,
              ...ClayShadows.card,
            }}
          />
          </View>

          <View style={{ marginTop: 20, gap: 12 }}>
            <Button
              variant="clayPrimary"
              onPress={handleNext}
              fullWidth
            >
              Next
            </Button>
            <Button variant="text" onPress={handleNext} fullWidth textStyle={{ color: ClayTheme.accent }}>
              Skip for now
            </Button>
            <Button variant="ghost" onPress={() => router.back()} fullWidth textStyle={{ color: ClayTheme.muted }}>
              Back
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
