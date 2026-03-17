import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";

export default function SignupScreen() {
  useEffect(() => {
    router.replace("/(auth)/login");
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.night,
      }}
    >
      <ActivityIndicator size="large" color={Colors.gold} />
    </View>
  );
}
