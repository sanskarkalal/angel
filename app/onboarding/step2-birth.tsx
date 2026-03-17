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
import { useOnboardingStore } from "@/store/onboardingStore";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

export default function Step2Birth() {
  const { data, setData } = useOnboardingStore();
  const [birthDate, setBirthDate] = useState<Date>(
    data.birth_date ? new Date(data.birth_date) : new Date(1995, 0, 1)
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
      style={{ flex: 1, backgroundColor: Colors.night }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        <ProgressBar currentStep={2} totalSteps={5} />

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
              When did you arrive?
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
                  color: Colors.textMuted,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                Birth Date
              </Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={{
                  backgroundColor: Colors.surface,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 10,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.body,
                    fontSize: 15,
                    color: Colors.textPrimary,
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

        <View style={{ marginTop: "auto", gap: 12 }}>
          <Button variant="primary" onPress={handleNext} fullWidth>
            Continue
          </Button>
          <Button
            variant="ghost"
            onPress={() => router.back()}
            fullWidth
          >
            Back
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
