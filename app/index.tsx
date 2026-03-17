import { Redirect } from "expo-router";

// Root index redirects to tabs (handled by _layout.tsx auth gate)
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
