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
import { useOnboardingStore } from "@/store/onboardingStore";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

export default function Step3Story() {
  const { data, setData } = useOnboardingStore();
  const [story, setStory] = useState(data.onboarding_story ?? "");

  function handleNext() {
    setData({ onboarding_story: story.trim() });
    router.push("/onboarding/step4-intentions");
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.night }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        <ProgressBar currentStep={3} totalSteps={5} />

        <View style={{ gap: 24, flex: 1 }}>
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontFamily: Fonts.display,
                fontSize: 20,
                color: Colors.textPrimary,
                letterSpacing: 1,
                lineHeight: 30,
              }}
            >
              What are you moving through right now?
            </Text>
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 14,
                color: Colors.textMuted,
                lineHeight: 22,
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
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
            style={{
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 12,
              padding: 16,
              color: Colors.textPrimary,
              fontFamily: Fonts.body,
              fontSize: 15,
              lineHeight: 24,
              minHeight: 180,
              flex: 1,
            }}
          />
        </View>

        <View style={{ gap: 12 }}>
          <Button variant="primary" onPress={handleNext} fullWidth>
            Continue
          </Button>
          <Button variant="text" onPress={handleNext} fullWidth>
            Skip for now
          </Button>
          <Button variant="ghost" onPress={() => router.back()} fullWidth>
            Back
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
