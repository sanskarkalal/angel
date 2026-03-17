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
import { useOnboardingStore } from "@/store/onboardingStore";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

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
      style={{ flex: 1, backgroundColor: Colors.night }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        <ProgressBar currentStep={4} totalSteps={5} />

        <View style={{ gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontFamily: Fonts.display,
                fontSize: 22,
                color: Colors.textPrimary,
                letterSpacing: 1,
                lineHeight: 32,
              }}
            >
              What are you calling in?
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
              backgroundColor: Colors.goldSurface,
              borderRadius: 10,
              padding: 14,
              borderWidth: 1,
              borderColor: Colors.goldBorder,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 13,
                color: Colors.textSecondary,
                lineHeight: 20,
                fontStyle: "italic",
              }}
            >
              "What you name aloud begins to breathe. These intentions will weave
              through every message I bring you."
            </Text>
          </View>
        </View>

        <View style={{ marginTop: "auto", gap: 12 }}>
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
