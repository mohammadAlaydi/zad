import { type TextStyle } from "react-native";

export const Typography: Record<string, TextStyle> = {
  display: { fontFamily: "Sora_700Bold", fontSize: 32, lineHeight: 38, letterSpacing: -0.4 },
  h1: { fontFamily: "Sora_700Bold", fontSize: 26, lineHeight: 32, letterSpacing: -0.2 },
  h2: { fontFamily: "Inter_600SemiBold", fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: "Inter_600SemiBold", fontSize: 17, lineHeight: 22 },
  body: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: "Inter_500Medium", fontSize: 15, lineHeight: 22 },
  small: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: "Inter_500Medium", fontSize: 12, lineHeight: 16 },
  button: { fontFamily: "Inter_600SemiBold", fontSize: 16, lineHeight: 22, letterSpacing: 0.1 },
};
