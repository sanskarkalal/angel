import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

function AngelLogo() {
  return (
    <View style={{ alignItems: "center", gap: 16, marginBottom: 48 }}>
      {/* Gold halo circle */}
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
          <Text style={{ fontSize: 24 }}>✦</Text>
        </View>
      </View>

      {/* Angel name */}
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  function validate(): boolean {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    if (!email.trim()) {
      setEmailError("Your email is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email.");
      valid = false;
    }
    if (!password) {
      setPasswordError("Your password is required.");
      valid = false;
    }
    return valid;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("invalid")) {
          setGeneralError("These credentials don't match our records. Are you sure about that?");
        } else {
          setGeneralError(error.message);
        }
        return;
      }

      router.replace("/(tabs)");
    } catch (err) {
      console.error("Login error:", err);
      setGeneralError("Something stirred the connection. Please try again.");
    } finally {
      setLoading(false);
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
          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            error={emailError}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            error={passwordError}
            onSubmitEditing={handleLogin}
          />

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

          <Button
            variant="primary"
            loading={loading}
            onPress={handleLogin}
            fullWidth
            style={{ marginTop: 8 }}
          >
            Enter
          </Button>

          <Pressable
            onPress={() => router.push("/(auth)/signup")}
            style={{ alignItems: "center", padding: 12 }}
          >
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 14,
                color: Colors.textSecondary,
              }}
            >
              First time here?{" "}
              <Text style={{ color: Colors.gold, fontFamily: Fonts.bodyBold }}>
                Begin your journey
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
