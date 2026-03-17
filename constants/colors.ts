export const Colors = {
  // Backgrounds
  night: "#0d0d14",
  night100: "#12121a",
  night200: "#1a1a26",

  // Gold Accent
  gold: "#C9A84C",
  goldDim: "#8a6f2e",
  goldLight: "#F5EDD6",
  goldSurface: "rgba(201, 168, 76, 0.07)",
  goldBorder: "rgba(201, 168, 76, 0.25)",

  // Surfaces
  surface: "rgba(255, 255, 255, 0.05)",
  surface2: "rgba(255, 255, 255, 0.08)",
  border: "rgba(255, 255, 255, 0.08)",
  borderGold: "rgba(201, 168, 76, 0.25)",

  // Text
  textPrimary: "rgba(255, 255, 255, 0.87)",
  textSecondary: "rgba(255, 255, 255, 0.55)",
  textMuted: "rgba(255, 255, 255, 0.3)",

  // Utility
  transparent: "transparent",
  white: "#ffffff",
  error: "#e57373",
  success: "#81c784",
} as const;

export type ColorKey = keyof typeof Colors;
