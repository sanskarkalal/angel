import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { Colors } from "@/constants/colors";

export default function Index() {
  const { user, loading } = useAuthStore();
  const { profile, loading: profileLoading } = useProfileStore();
  const isLoading = loading || (!!user && profileLoading);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.night,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile || !profile.onboarding_complete) {
    return <Redirect href="/onboarding/step1-name" />;
  }

  return <Redirect href="/(tabs)" />;
}
