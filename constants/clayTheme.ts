export const ClayTheme = {
  canvas: "#120F1F",
  card: "rgba(255,255,255,0.09)",
  cardRaised: "rgba(255,255,255,0.14)",
  input: "rgba(14,11,24,0.72)",
  inputBorder: "rgba(255,255,255,0.14)",
  text: "rgba(248,244,255,0.92)",
  muted: "rgba(219,205,240,0.72)",
  accent: "#A78BFA",
  accentStrong: "#7C3AED",
  accentAlt: "#DB2777",
  gold: "#E8CD8A",
  white: "#FFFFFF",
  darkText: "#090512",
  border: "rgba(255,255,255,0.12)",
} as const;

export const ClayShadows = {
  card: {
    shadowColor: "#090610",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.34,
    shadowRadius: 28,
    elevation: 14,
  },
  button: {
    shadowColor: "#110A1D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;
