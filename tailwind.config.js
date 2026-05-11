/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Core brand palette pulled from the PDF
        primary: {
          50: "#F4EFFA",
          100: "#E7DCF5",
          200: "#CFB8EB",
          300: "#A98AD6",
          400: "#8159C2",
          500: "#6B36B0",
          600: "#5B2C9C",
          700: "#4B1F8A",
          800: "#3A1670",
          900: "#2A0F55",
        },
        accent: {
          DEFAULT: "#1FCFA5",
          green: "#1FCFA5",
          red: "#E25563",
        },
        ink: {
          900: "#101225",
          800: "#1B1F36",
          700: "#2A2E48",
          600: "#4A4F66",
          500: "#6B7186",
          400: "#9096AB",
          300: "#C4C8D6",
          200: "#E2E4ED",
          100: "#EFF0F6",
          50: "#F7F8FC",
        },
        card: "#FFFFFF",
        bg: "#F6F5FB",
      },
      fontFamily: {
        sans: ["Inter_400Regular", "System"],
        medium: ["Inter_500Medium", "System"],
        semibold: ["Inter_600SemiBold", "System"],
        bold: ["Inter_700Bold", "System"],
        display: ["Sora_700Bold", "System"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        card: "0 8px 24px rgba(75, 31, 138, 0.08)",
      },
    },
  },
  plugins: [],
};
