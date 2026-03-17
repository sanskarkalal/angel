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
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

function AngelLogo() {
  return (
    <View style={{ alignItems: "center", gap: 16, marginBottom: 40 }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          borderWidth: 1.5,
          borderColor: Colors.goldBorder,
          backgroundColor: Colors.goldSurface,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 20 }}>✦</Text>
      </View>
      <Text
        style={{
          fontFamily: Fonts.display,
          fontSize: 30,
          color: Colors.gold,
          letterSpacing: 7,
        }}
      >
        ANGEL
      </Text>
      <Text
        style={{
          fontFamily: Fonts.body,
          fontSize: 14,
          color: Colors.textSecondary,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        I have been waiting for you.
      </Text>
    </View>
  );
}

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [generalError, setGeneralError] = useState("");

  function validate(): boolean {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setConfirmError("");
    setGeneralError("");

    if (!email.trim()) {
      setEmailError("Your email is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email.");
      valid = false;
    }
    if (!password) {
      setPasswordError("A password is required.");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("At least 8 characters, dear.");
      valid = false;
    }
    if (!confirmPassword) {
      setConfirmError("Please confirm your password.");
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError("These passwords don't match.");
      valid = false;
    }
    return valid;
  }

  async function handleSignup() {
    if (!validate()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          setGeneralError("This soul is already known to us. Try logging in instead.");
        } else {
          setGeneralError(error.message);
        }
        return;
      }

      if (data.user) {
        router.replace("/onboarding/step1-name");
      }
    } catch (err) {
      console.error("Signup error:", err);
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
            autoComplete="new-password"
            error={passwordError}
          />

          <Input
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="new-password"
            error={confirmError}
            onSubmitEditing={handleSignup}
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
            onPress={handleSignup}
            fullWidth
            style={{ marginTop: 8 }}
          >
            Begin
          </Button>

          <Pressable
            onPress={() => router.back()}
            style={{ alignItems: "center", padding: 12 }}
          >
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 14,
                color: Colors.textSecondary,
              }}
            >
              Already know me?{" "}
              <Text style={{ color: Colors.gold, fontFamily: Fonts.bodyBold }}>
                Come back
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
