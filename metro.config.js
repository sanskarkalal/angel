const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

try {
  module.exports = withNativeWind(config, { input: "./global.css" });
} catch (error) {
  // Some Windows environments cannot write NativeWind cache into node_modules.
  // Fall back to default Metro so the app can still run.
  console.warn(
    "[metro] NativeWind disabled for this session:",
    error instanceof Error ? error.message : String(error)
  );
  module.exports = config;
}
