export const Fonts = {
  display: "Cinzel_500Medium",
  body: "Lato_300Light",
  bodyBold: "Lato_700Bold",
  bodyItalic: "Lato_300Light_Italic",
  bodyBoldItalic: "Lato_700Bold_Italic",
} as const;

export type FontKey = keyof typeof Fonts;
