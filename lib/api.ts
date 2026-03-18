import { Platform } from "react-native";

const LOCAL_IOS_URL = "http://localhost:3000";
const LOCAL_ANDROID_EMULATOR_URL = "http://10.0.2.2:3000";

export function getApiUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!raw) {
    return Platform.OS === "android" ? LOCAL_ANDROID_EMULATOR_URL : LOCAL_IOS_URL;
  }

  // Android emulator cannot reach host "localhost" directly.
  if (Platform.OS === "android") {
    return raw
      .replace("://localhost", "://10.0.2.2")
      .replace("://127.0.0.1", "://10.0.2.2");
  }

  return raw;
}
