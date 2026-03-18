import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/angel/ProgressBar";
import { ClayBackdrop } from "@/components/angel/ClayBackdrop";
import { useOnboardingStore } from "@/store/onboardingStore";
import { Fonts } from "@/constants/fonts";
import { ClayShadows, ClayTheme } from "@/constants/clayTheme";

export default function Step2Birth() {
  const { data, setData } = useOnboardingStore();
  const [birthDate, setBirthDate] = useState<Date>(
    data.birth_date ? new Date(data.birth_date) : new Date(1995, 0, 1),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthTime, setBirthTime] = useState(data.birth_time ?? "");
  const [birthCity, setBirthCity] = useState(data.birth_city ?? "");

  function handleDateChange(_event: DateTimePickerEvent, date?: Date) {
    setShowDatePicker(Platform.OS === "ios");
    if (date) setBirthDate(date);
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function handleNext() {
    setData({
      birth_date: birthDate.toISOString().split("T")[0],
      birth_time: birthTime.trim() || undefined,
      birth_city: birthCity.trim() || undefined,
    });
    router.push("/onboarding/step3-story");
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
          <ProgressBar currentStep={2} totalSteps={5} />

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
                When did you arrive?
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
                The stars remember the moment you arrived.
              </Text>
            </View>

            <View style={{ gap: 20 }}>
              {/* Birth Date */}
              <View style={{ gap: 8 }}>
                <Text
                  style={{
                    fontFamily: Fonts.bodyBold,
                    fontSize: 11,
                    color: ClayTheme.muted,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                  }}
                >
                  Birth Date
                </Text>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={{
                    backgroundColor: ClayTheme.input,
                    borderWidth: 1,
                    borderColor: ClayTheme.inputBorder,
                    borderRadius: 20,
                    paddingVertical: 16,
                    paddingHorizontal: 18,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.body,
                      fontSize: 16,
                      color: ClayTheme.text,
                    }}
                  >
                    {formatDate(birthDate)}
                  </Text>
                </Pressable>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={birthDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  themeVariant="dark"
                />
              )}

              <Input
                label="Birth Time (optional)"
                placeholder="e.g. 3:42 PM"
                value={birthTime}
                onChangeText={setBirthTime}
                keyboardType="default"
              />

              <Input
                label="Birth City (optional)"
                placeholder="e.g. Mumbai, India"
                value={birthCity}
                onChangeText={setBirthCity}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={{ marginTop: 20, gap: 12 }}>
            <Button variant="clayPrimary" onPress={handleNext} fullWidth>
              Next
            </Button>
            <Button
              variant="ghost"
              onPress={() => router.back()}
              fullWidth
              textStyle={{ color: ClayTheme.muted }}
            >
              Back
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
