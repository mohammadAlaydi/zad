import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { ViewStyle } from "react-native";

export function GradientBg({ children, style, colors }: { children?: ReactNode; style?: ViewStyle; colors?: [string, string, ...string[]] }) {
  return (
    <LinearGradient
      colors={colors ?? ["#F4EFFA", "#FCE7F3"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </LinearGradient>
  );
}
