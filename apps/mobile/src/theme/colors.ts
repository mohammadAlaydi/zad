// Color tokens sourced from the ZADPAY UX/UI PDF.
// Keep in sync with tailwind.config.js.
export const Colors = {
  brand: {
    primary: "#5B2C9C",
    primaryDark: "#4B1F8A",
    primaryLight: "#8159C2",
    primary50: "#F4EFFA",
    primary100: "#E7DCF5",
    primary200: "#CFB8EB",
    gradientStart: "#6B36B0",
    gradientEnd: "#3A1670",
  },
  accent: {
    green: "#1FCFA5",
    greenSoft: "#D7F7EE",
    red: "#E25563",
    redSoft: "#FBE3E5",
    amber: "#F2B441",
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
  surface: {
    background: "#F6F5FB",
    card: "#FFFFFF",
    overlay: "rgba(16, 18, 37, 0.55)",
  },
  white: "#FFFFFF",
  black: "#000000",
};

export type ColorKey = keyof typeof Colors;
