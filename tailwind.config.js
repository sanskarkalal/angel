/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "#0d0d14",
          100: "#12121a",
          200: "#1a1a26",
        },
        gold: {
          DEFAULT: "#C9A84C",
          dim: "#8a6f2e",
          light: "#F5EDD6",
          surface: "rgba(201, 168, 76, 0.07)",
          border: "rgba(201, 168, 76, 0.25)",
        },
      },
      fontFamily: {
        cinzel: ["Cinzel_500Medium"],
        lato: ["Lato_300Light"],
        "lato-bold": ["Lato_700Bold"],
      },
    },
  },
  plugins: [],
};
