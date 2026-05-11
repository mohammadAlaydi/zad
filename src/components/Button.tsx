import { ReactNode } from "react";
import { Pressable, Text, ActivityIndicator, ViewStyle, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useHaptic } from "@/hooks/useHaptic";
import { Colors } from "@/theme/colors";

type Props = {
  title?: string;
  children?: ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "dark" | "light";
  disabled?: boolean;
  loading?: boolean;
  size?: "md" | "lg" | "sm";
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: ReactNode;
};

export function Button({
  title,
  children,
  onPress,
  variant = "primary",
  disabled,
  loading,
  size = "lg",
  fullWidth = true,
  style,
  icon,
}: Props) {
  const haptic = useHaptic();

  const heights = { sm: 44, md: 52, lg: 58 };
  const fontSize = { sm: 14, md: 15, lg: 16 };

  const baseStyle: ViewStyle = {
    height: heights[size],
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 28,
    width: fullWidth ? "100%" : undefined,
    overflow: "hidden",
  };

  const isPrimary = variant === "primary";
  const isDark = variant === "dark";
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";
  const isLight = variant === "light";

  const bg = isPrimary
    ? disabled
      ? Colors.ink[300]
      : Colors.brand.primary
    : isDark
    ? Colors.ink[900]
    : isSecondary
    ? "transparent"
    : isLight
    ? Colors.white
    : "transparent";

  const textColor = isPrimary || isDark
    ? Colors.white
    : isLight
    ? Colors.brand.primary
    : Colors.brand.primary;

  const border = isSecondary
    ? { borderWidth: 1.5, borderColor: Colors.brand.primary }
    : isLight
    ? { borderWidth: 1, borderColor: Colors.ink[200] }
    : {};

  const content = (
    <>
      {icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={{
            color: textColor,
            fontFamily: "Inter_600SemiBold",
            fontSize: fontSize[size],
            letterSpacing: 0.2,
          }}
        >
          {title ?? children}
        </Text>
      )}
    </>
  );

  return (
    <MotiView
      from={{ scale: 1 }}
      animate={{ scale: 1 }}
      transition={{ type: "timing", duration: 120 }}
      style={[{ width: fullWidth ? "100%" : undefined }, style]}
    >
      <Pressable
        onPress={() => {
          if (disabled || loading) return;
          haptic.light();
          onPress?.();
        }}
        disabled={disabled || loading}
        style={({ pressed }) => [
          baseStyle,
          border,
          { backgroundColor: bg },
          isPrimary && !disabled
            ? {
                shadowColor: Colors.brand.primary,
                shadowOpacity: 0.35,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
                elevation: 6,
              }
            : null,
          pressed && !disabled ? { transform: [{ scale: 0.97 }], opacity: 0.95 } : null,
        ]}
      >
        {isPrimary && !disabled ? (
          <LinearGradient
            colors={[Colors.brand.primaryLight, Colors.brand.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
        ) : null}
        {content}
      </Pressable>
    </MotiView>
  );
}
