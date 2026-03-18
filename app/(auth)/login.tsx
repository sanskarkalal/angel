import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";
import { supabase } from "@/lib/supabase";
import { Fonts } from "@/constants/fonts";
import { ClayBackdrop } from "@/components/angel/ClayBackdrop";
import { ClayShadows, ClayTheme } from "@/constants/clayTheme";

WebBrowser.maybeCompleteAuthSession();

function parseParams(input: string) {
  const params: Record<string, string> = {};
  if (!input) return params;

  for (const part of input.split("&")) {
    const [rawKey, rawValue = ""] = part.split("=");
    if (!rawKey) continue;
    params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue);
  }

  return params;
}

function extractOAuthParams(url: string) {
  const [base, hash = ""] = url.split("#");
  const query = base.split("?")[1] ?? "";
  const queryParams = parseParams(query);
  const hashParams = parseParams(hash);

  const accessToken = hashParams.access_token ?? queryParams.access_token;
  const refreshToken = hashParams.refresh_token ?? queryParams.refresh_token;
  const errorDescription =
    queryParams.error_description ??
    queryParams.error ??
    hashParams.error_description ??
    hashParams.error;

  return { accessToken, refreshToken, errorDescription };
}

function AngelLogo() {
  return (
    <View style={{ alignItems: "center", gap: 14, marginBottom: 36 }}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          borderWidth: 1,
          borderColor: ClayTheme.border,
          backgroundColor: ClayTheme.cardRaised,
          alignItems: "center",
          justifyContent: "center",
          ...ClayShadows.card,
        }}
      >
        <View
          style={{
            width: 62,
            height: 62,
            borderRadius: 31,
            borderWidth: 1,
            borderColor: ClayTheme.gold,
            backgroundColor: "rgba(232,205,138,0.12)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 24, color: ClayTheme.gold }}>✦</Text>
        </View>
      </View>

      <Text
        style={{
          fontFamily: Fonts.display,
          fontSize: 40,
          color: ClayTheme.text,
          letterSpacing: 6,
          textTransform: "uppercase",
        }}
      >
        ANGEL
      </Text>
      <Text
        style={{
          fontFamily: Fonts.body,
          fontSize: 14,
          color: ClayTheme.muted,
          letterSpacing: 1.4,
        }}
      >
        Your guardian. Always with you.
      </Text>
    </View>
  );
}

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  async function completeOAuthFromUrl(url: string) {
    const { accessToken, refreshToken, errorDescription } = extractOAuthParams(url);

    if (errorDescription) {
      setGeneralError(errorDescription);
      return false;
    }

    if (!accessToken || !refreshToken) {
      setGeneralError("Could not complete Google sign-in. Missing tokens.");
      return false;
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      setGeneralError(sessionError.message);
      return false;
    }

    router.replace("/onboarding/step1-name");
    return true;
  }

  useEffect(() => {
    Linking.getInitialURL()
      .then((url) => {
        if (!url || !url.includes("access_token")) return;
        void completeOAuthFromUrl(url);
      })
      .catch((err) => {
        console.error("Initial deep link error:", err);
      });
  }, []);

  async function handleGoogleSignIn() {
    setGeneralError("");
    setLoading(true);

    try {
      const isExpoGo = Constants.appOwnership === "expo";
      const redirectTo =
        Platform.OS === "web"
          ? makeRedirectUri({ path: "auth/callback" })
          : isExpoGo
            ? makeRedirectUri({ path: "auth/callback" })
            : makeRedirectUri({
                scheme: "angel",
                path: "auth/callback",
                preferLocalhost: true,
              });

      if (Platform.OS === "web") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
          },
        });

        if (error) {
          setGeneralError(error.message);
        }
        return;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        setGeneralError(error.message);
        return;
      }

      if (!data?.url) {
        setGeneralError("Google sign-in URL was not returned.");
        return;
      }
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== "success") {
        setGeneralError("Google sign-in was canceled.");
        setLoading(false);
        return;
      }

      await completeOAuthFromUrl(result.url);
      setLoading(false);
    } catch (err) {
      console.error("Google login error:", err);
      setGeneralError("Google sign-in failed. Please try again.");
      if (Platform.OS !== "web") {
        setLoading(false);
      }
    } finally {
      if (Platform.OS === "web") {
        setLoading(false);
      }
    }
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
          justifyContent: "center",
          padding: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            borderRadius: 34,
            padding: 24,
            borderWidth: 1,
            borderColor: ClayTheme.border,
            backgroundColor: ClayTheme.card,
            ...ClayShadows.card,
          }}
        >
          <AngelLogo />

          <View style={{ gap: 16 }}>
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 15,
                color: ClayTheme.muted,
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              Sign in with Google to continue.
            </Text>

            {generalError ? (
              <Text
                style={{
                  fontFamily: Fonts.body,
                  fontSize: 13,
                  color: "#FF8787",
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                {generalError}
              </Text>
            ) : null}

            <Pressable
              onPress={handleGoogleSignIn}
              disabled={loading}
              style={({ pressed }) => ({
                marginTop: 8,
                width: "100%",
                minHeight: 58,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.65)",
                backgroundColor: ClayTheme.white,
                paddingHorizontal: 18,
                alignItems: "center",
                justifyContent: "center",
                opacity: loading ? 0.7 : pressed ? 0.9 : 1,
                shadowColor: "#0D0718",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.35,
                shadowRadius: 18,
                elevation: 12,
              })}
            >
              {loading ? (
                <ActivityIndicator size="small" color={ClayTheme.darkText} />
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.bodyBold,
                    fontSize: 16,
                    letterSpacing: 0.2,
                    color: ClayTheme.darkText,
                  }}
                >
                  Continue with Google
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
