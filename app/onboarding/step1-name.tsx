import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated as RNAnimated,
} from "react-native";
import { router } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/angel/ProgressBar";
import { AngelMessage } from "@/components/angel/AngelMessage";
import { useOnboardingStore } from "@/store/onboardingStore";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

const PRONOUN_OPTIONS = [
  "she/her",
  "he/him",
  "they/them",
  "she/they",
  "he/they",
  "any",
  "prefer not to say",
];

export default function Step1Name() {
  const { data, setData } = useOnboardingStore();
  const [name, setName] = useState(data.name ?? "");
  const [pronouns, setPronouns] = useState(data.pronouns ?? "");
  const [nameError, setNameError] = useState("");
  const messageOpacity = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(messageOpacity, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  function handleNext() {
    if (!name.trim()) {
      setNameError("I need to know what to call you.");
      return;
    }
    setNameError("");
    setData({ name: name.trim(), pronouns });
    router.push("/onboarding/step2-birth");
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
        <ProgressBar currentStep={1} totalSteps={5} />

        <RNAnimated.View style={{ opacity: messageOpacity, gap: 24, flex: 1 }}>
          <AngelMessage message="I have been waiting for you. Step into this space slowly — there is no rush here." />

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
              What shall I call you?
            </Text>
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 14,
                color: Colors.textMuted,
                lineHeight: 22,
              }}
            >
              The name you carry into your truest self.
            </Text>
          </View>

          <View style={{ gap: 20 }}>
            <Input
              label="Your name"
              placeholder="Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              error={nameError}
            />

            <View style={{ gap: 10 }}>
              <Text
                style={{
                  fontFamily: Fonts.bodyBold,
                  fontSize: 11,
                  color: Colors.textMuted,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                Pronouns (optional)
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {PRONOUN_OPTIONS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setPronouns(pronouns === option ? "" : option)}
                    style={{
                      paddingVertical: 7,
                      paddingHorizontal: 14,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor:
                        pronouns === option ? Colors.gold : Colors.border,
                      backgroundColor:
                        pronouns === option ? Colors.goldSurface : Colors.surface,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.body,
                        fontSize: 13,
                        color:
                          pronouns === option
                            ? Colors.gold
                            : Colors.textSecondary,
                      }}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={{ marginTop: "auto", gap: 12 }}>
            <Button variant="primary" onPress={handleNext} fullWidth>
              Continue
            </Button>
          </View>
        </RNAnimated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
