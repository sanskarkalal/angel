import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/angel/ProgressBar";
import { ClayBackdrop } from "@/components/angel/ClayBackdrop";
import { useOnboardingStore } from "@/store/onboardingStore";
import { Fonts } from "@/constants/fonts";
import { ClayShadows, ClayTheme } from "@/constants/clayTheme";

const PLACEHOLDERS = [
  "I am calling in clarity",
  "I am welcoming abundance",
  "I am opening to love",
];

export default function Step4Intentions() {
  const { data, setData } = useOnboardingStore();
  const [intentions, setIntentions] = useState<string[]>(
    data.intentions ?? ["", "", ""]
  );

  function updateIntention(index: number, value: string) {
    const updated = [...intentions];
    updated[index] = value;
    setIntentions(updated);
  }

  function handleNext() {
    const filtered = intentions.filter((i) => i.trim().length > 0);
    setData({ intentions: filtered });
    router.push("/onboarding/step5-photo");
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
          <ProgressBar currentStep={4} totalSteps={5} />

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
              What are you calling in?
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
              Name the energies you wish to draw closer. Speak them with conviction.
            </Text>
          </View>

          <View style={{ gap: 14 }}>
            {intentions.map((intention, index) => (
              <Input
                key={index}
                label={`Intention ${index + 1}`}
                placeholder={PLACEHOLDERS[index]}
                value={intention}
                onChangeText={(val) => updateIntention(index, val)}
                autoCapitalize="sentences"
              />
            ))}
          </View>

          <View
            style={{
              backgroundColor: "rgba(232,205,138,0.10)",
              borderRadius: 20,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(232,205,138,0.35)",
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 13,
                color: ClayTheme.muted,
                lineHeight: 20,
                fontStyle: "italic",
              }}
            >
              "What you name aloud begins to breathe. These intentions will weave
              through every message I bring you."
            </Text>
          </View>
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
