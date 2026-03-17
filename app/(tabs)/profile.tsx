import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useProfileStore } from "@/store/profileStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getLifePathMeaning } from "@/lib/numerology";
import { getMoonPhase } from "@/lib/moonphase";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

interface InfoRowProps {
  label: string;
  value: string | number | null | undefined;
}

function InfoRow({ label, value }: InfoRowProps) {
  if (!value) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.bodyBold,
          fontSize: 11,
          color: Colors.textMuted,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.body,
          fontSize: 14,
          color: Colors.textPrimary,
          textAlign: "right",
          flex: 1,
          marginLeft: 16,
        }}
      >
        {String(value)}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, clearProfile } = useProfileStore();
  const { signOut } = useAuthStore();
  const [signingOut, setSigningOut] = useState(false);
  const moonPhase = getMoonPhase();

  async function handleLogout() {
    Alert.alert(
      "Until we meet again",
      "Are you sure you want to step away?",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Farewell",
          style: "destructive",
          onPress: async () => {
            setSigningOut(true);
            try {
              await supabase.auth.signOut();
              clearProfile();
              signOut();
              router.replace("/(auth)/login");
            } catch (err) {
              console.error("Logout error:", err);
              setSigningOut(false);
            }
          },
        },
      ]
    );
  }

  if (!profile) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.night,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontFamily: Fonts.body, color: Colors.textMuted }}>
          Loading your essence...
        </Text>
      </View>
    );
  }

  const lifePathMeaning = profile.life_path_number
    ? getLifePathMeaning(profile.life_path_number)
    : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.night }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 32,
        padding: 24,
        gap: 28,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ alignItems: "center", gap: 16 }}>
        {/* Avatar */}
        {profile.photo_url ? (
          <Image
            source={{ uri: profile.photo_url }}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              borderWidth: 2,
              borderColor: Colors.goldBorder,
            }}
          />
        ) : (
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: Colors.goldSurface,
              borderWidth: 1.5,
              borderColor: Colors.goldBorder,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 32 }}>✦</Text>
          </View>
        )}

        <View style={{ alignItems: "center", gap: 4 }}>
          <Text
            style={{
              fontFamily: Fonts.display,
              fontSize: 24,
              color: Colors.gold,
              letterSpacing: 2,
            }}
          >
            {profile.name.toUpperCase()}
          </Text>
          {profile.pronouns && (
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 13,
                color: Colors.textMuted,
              }}
            >
              {profile.pronouns}
            </Text>
          )}
        </View>

        {/* Moon phase */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingVertical: 5,
            paddingHorizontal: 14,
            backgroundColor: Colors.goldSurface,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: Colors.goldBorder,
          }}
        >
          <Text style={{ fontSize: 13 }}>{moonPhase.emoji}</Text>
          <Text
            style={{
              fontFamily: Fonts.bodyBold,
              fontSize: 11,
              color: Colors.gold,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {moonPhase.name}
          </Text>
        </View>
      </View>

      {/* Cosmic Profile */}
      <View
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.border,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.display,
            fontSize: 13,
            color: Colors.gold,
            letterSpacing: 2,
            textTransform: "uppercase",
            paddingTop: 16,
            paddingBottom: 12,
          }}
        >
          Cosmic Profile
        </Text>
        <Separator />

        {profile.sun_sign && (
          <>
            <InfoRow label="Sun Sign" value={`☀️ ${profile.sun_sign}`} />
            <Separator />
          </>
        )}
        {profile.moon_sign && (
          <>
            <InfoRow label="Moon Sign" value={`🌙 ${profile.moon_sign}`} />
            <Separator />
          </>
        )}
        {profile.rising_sign && (
          <>
            <InfoRow label="Rising" value={`↑ ${profile.rising_sign}`} />
            <Separator />
          </>
        )}
        {profile.life_path_number && (
          <InfoRow
            label="Life Path"
            value={`${profile.life_path_number} — ${lifePathMeaning?.split("—")[1]?.trim() ?? ""}`}
          />
        )}
        {!profile.sun_sign && !profile.moon_sign && !profile.life_path_number && (
          <Text
            style={{
              fontFamily: Fonts.body,
              fontSize: 13,
              color: Colors.textMuted,
              textAlign: "center",
              paddingVertical: 16,
              fontStyle: "italic",
            }}
          >
            The stars are still learning your name.
          </Text>
        )}
      </View>

      {/* Intentions */}
      {profile.intentions && profile.intentions.length > 0 && (
        <View
          style={{
            backgroundColor: Colors.goldSurface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: Colors.goldBorder,
            padding: 20,
            gap: 12,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.display,
              fontSize: 13,
              color: Colors.gold,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Active Intentions
          </Text>
          {profile.intentions.map((intention, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
              <Text style={{ color: Colors.gold, fontSize: 12, marginTop: 3 }}>✦</Text>
              <Text
                style={{
                  fontFamily: Fonts.body,
                  fontSize: 14,
                  color: Colors.textSecondary,
                  lineHeight: 22,
                  flex: 1,
                  fontStyle: "italic",
                }}
              >
                {intention}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Birth info */}
      {(profile.birth_date || profile.birth_city) && (
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.display,
              fontSize: 13,
              color: Colors.textSecondary,
              letterSpacing: 2,
              textTransform: "uppercase",
              paddingTop: 16,
              paddingBottom: 12,
            }}
          >
            Origins
          </Text>
          <Separator />
          {profile.birth_date && (
            <>
              <InfoRow
                label="Born"
                value={new Date(profile.birth_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
              {profile.birth_city && <Separator />}
            </>
          )}
          {profile.birth_city && (
            <InfoRow label="Place" value={profile.birth_city} />
          )}
        </View>
      )}

      {/* Sign out */}
      <Button
        variant="ghost"
        onPress={handleLogout}
        loading={signingOut}
        fullWidth
        style={{ marginTop: 8, borderColor: "rgba(255,100,100,0.2)" }}
        textStyle={{ color: Colors.error }}
      >
        Step away
      </Button>
    </ScrollView>
  );
}
