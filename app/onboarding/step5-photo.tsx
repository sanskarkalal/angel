import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/angel/ProgressBar";
import { ClayBackdrop } from "@/components/angel/ClayBackdrop";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import { useAuthStore } from "@/store/authStore";
import { getApiUrl } from "@/lib/api";
import { Fonts } from "@/constants/fonts";
import { ClayShadows, ClayTheme } from "@/constants/clayTheme";

const API_URL = getApiUrl();

export default function Step5Photo() {
  const { data, setData, reset } = useOnboardingStore();
  const { setProfile } = useProfileStore();
  const { session } = useAuthStore();
  const [photoUri, setPhotoUri] = useState<string | null>(data.photo_uri ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Angel needs access to your photos to see your face.",
        [{ text: "Understood" }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      setData({ photo_uri: uri });
    }
  }

  async function handleComplete(skipPhoto = false) {
    if (!session?.access_token) {
      setError("Session expired. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        name: data.name,
        pronouns: data.pronouns || null,
        birth_date: data.birth_date || null,
        birth_time: data.birth_time || null,
        birth_city: data.birth_city || null,
        onboarding_story: data.onboarding_story || null,
        intentions: data.intentions?.filter((i) => i.trim()) || [],
        photo_uri: skipPhoto ? null : (photoUri ?? null),
      };

      const response = await fetch(`${API_URL}/api/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error ?? "Onboarding failed");
      }

      const { profile } = await response.json() as {
        profile: {
          id: string;
          user_id: string;
          name: string;
          pronouns: string | null;
          birth_date: string | null;
          birth_time: string | null;
          birth_city: string | null;
          sun_sign: string | null;
          moon_sign: string | null;
          rising_sign: string | null;
          life_path_number: number | null;
          onboarding_story: string | null;
          intentions: string[] | null;
          photo_url: string | null;
          onboarding_complete: boolean;
          created_at: string;
        }
      };

      setProfile(profile);
      reset();
      router.replace("/(tabs)");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something interrupted us. Please try again.";
      console.error("Onboarding submit error:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
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
          <ProgressBar currentStep={5} totalSteps={5} />

          <View style={{ gap: 24, alignItems: "center", marginTop: 14 }}>
          <View style={{ gap: 8, alignItems: "center" }}>
            <Text
              style={{
                fontFamily: Fonts.display,
                fontSize: 24,
                color: ClayTheme.text,
                letterSpacing: 0.8,
                textAlign: "center",
              }}
            >
              May I see your face?
            </Text>
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 15,
                color: ClayTheme.muted,
                lineHeight: 24,
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              A face carries the whole story of a soul.
            </Text>
          </View>

          {/* Photo circle */}
          <View
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              borderWidth: 2,
              borderColor: photoUri ? ClayTheme.gold : ClayTheme.border,
              backgroundColor: ClayTheme.input,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              ...ClayShadows.card,
            }}
          >
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={{ width: 160, height: 160, borderRadius: 80 }}
              />
            ) : (
              <Text
                style={{
                  fontSize: 48,
                  opacity: 0.5,
                  color: ClayTheme.gold,
                }}
              >
                ✦
              </Text>
            )}
          </View>

          <Button variant="ghost" onPress={pickPhoto}>
            {photoUri ? "Choose a different photo" : "Choose a photo"}
          </Button>
        </View>

        {error ? (
          <Text
            style={{
              fontFamily: Fonts.body,
              fontSize: 13,
              color: "#FF8787",
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            {error}
          </Text>
        ) : null}

        <View style={{ marginTop: 20, gap: 12 }}>
          <Button
            variant="clayPrimary"
            onPress={() => handleComplete(false)}
            loading={loading}
            fullWidth
          >
            {photoUri ? "Complete my journey" : "Complete without photo"}
          </Button>
          {!photoUri && (
            <Button
              variant="text"
              onPress={() => handleComplete(true)}
              disabled={loading}
              fullWidth
              textStyle={{ color: ClayTheme.accent }}
            >
              Skip
            </Button>
          )}
          <Button
            variant="ghost"
            onPress={() => router.back()}
            disabled={loading}
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
