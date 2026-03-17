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
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

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

function upsertQueryParam(url: string, key: string, value: string) {
  const [base, hashPart = ""] = url.split("#");
  const [path, queryPart = ""] = base.split("?");
  const current = parseParams(queryPart);
  current[key] = value;

  const nextQuery = Object.entries(current)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  return `${path}?${nextQuery}${hashPart ? `#${hashPart}` : ""}`;
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
    <View style={{ alignItems: "center", gap: 16, marginBottom: 48 }}>
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          borderWidth: 1.5,
          borderColor: Colors.goldBorder,
          backgroundColor: Colors.goldSurface,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: Colors.gold,
            backgroundColor: "rgba(201,168,76,0.12)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 24 }}>*</Text>
        </View>
      </View>

      <Text
        style={{
          fontFamily: Fonts.display,
          fontSize: 36,
          color: Colors.gold,
          letterSpacing: 8,
          textTransform: "uppercase",
        }}
      >
        ANGEL
      </Text>
      <Text
        style={{
          fontFamily: Fonts.body,
          fontSize: 13,
          color: Colors.textMuted,
          letterSpacing: 3,
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

    router.replace("/(tabs)");
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
      const redirectTo =
        Platform.OS === "web"
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
      const oauthUrl = upsertQueryParam(data.url, "redirect_to", redirectTo);

      const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectTo);
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
      style={{ flex: 1, backgroundColor: Colors.night }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <AngelLogo />

        <View style={{ gap: 16 }}>
          <Text
            style={{
              fontFamily: Fonts.body,
              fontSize: 14,
              color: Colors.textSecondary,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Sign in with Google to continue.
          </Text>

          {generalError ? (
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 13,
                color: Colors.error,
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
              minHeight: 54,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 18,
              alignItems: "center",
              justifyContent: "center",
              opacity: loading ? 0.7 : pressed ? 0.9 : 1,
            })}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#202124" />
            ) : (
              <Text
                style={{
                  fontFamily: Fonts.bodyBold,
                  fontSize: 16,
                  letterSpacing: 0.2,
                  color: "#202124",
                }}
              >
                Continue with Google
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
