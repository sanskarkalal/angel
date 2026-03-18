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
import { ClayBackdrop } from "@/components/angel/ClayBackdrop";
import { useOnboardingStore } from "@/store/onboardingStore";
import { Fonts } from "@/constants/fonts";
import { ClayShadows, ClayTheme } from "@/constants/clayTheme";

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
      style={{ flex: 1, backgroundColor: ClayTheme.canvas }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ClayBackdrop />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          gap: 20,
        }}
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
          <ProgressBar currentStep={1} totalSteps={5} />

          <RNAnimated.View style={{ opacity: messageOpacity, gap: 20, marginTop: 14 }}>
            <AngelMessage message="I have been waiting for you. Step into this space slowly — there is no rush here." />

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
                What shall I call you?
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.body,
                  fontSize: 15,
                  color: ClayTheme.muted,
                  lineHeight: 24,
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
                    color: ClayTheme.muted,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                  }}
                >
                  Pronouns (optional)
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {PRONOUN_OPTIONS.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() =>
                        setPronouns(pronouns === option ? "" : option)
                      }
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 15,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor:
                          pronouns === option ? ClayTheme.gold : ClayTheme.inputBorder,
                        backgroundColor:
                          pronouns === option
                            ? "rgba(232,205,138,0.12)"
                            : ClayTheme.input,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.body,
                          fontSize: 13,
                          color:
                            pronouns === option
                              ? ClayTheme.gold
                              : ClayTheme.muted,
                        }}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View style={{ gap: 12 }}>
              <Button
                variant="clayPrimary"
                onPress={handleNext}
                fullWidth
              >
                Next
              </Button>
            </View>
          </RNAnimated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
