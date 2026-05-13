import { LinearGradient } from "expo-linear-gradient";
import { type ReactNode } from "react";
import { Pressable, Text, ActivityIndicator, type ViewStyle, View, StyleSheet } from "react-native";
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

  const textColor =
    isPrimary || isDark ? Colors.white : isLight ? Colors.brand.primary : Colors.brand.primary;

  const sizeKey = size === "sm" ? styles.sizeSm : size === "md" ? styles.sizeMd : styles.sizeLg;
  const fontSizeVal = size === "sm" ? 14 : size === "md" ? 15 : 16;

  return (
    <View style={[fullWidth ? styles.fullWidth : undefined, style]}>
      <Pressable
        onPress={() => {
          if (disabled || loading) return;
          haptic.light();
          onPress?.();
        }}
        disabled={disabled || loading}
        style={[
          styles.base,
          sizeKey,
          { backgroundColor: bg },
          isSecondary ? styles.borderSecondary : null,
          isLight ? styles.borderLight : null,
          isPrimary && !disabled ? styles.primaryShadow : null,
        ]}
      >
        {isPrimary && !disabled ? (
          <LinearGradient
            colors={[Colors.brand.primaryLight, Colors.brand.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
        ) : null}
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Text style={[styles.label, { color: textColor, fontSize: fontSizeVal }]}>
            {title ?? children}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: "100%",
  },
  base: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 28,
    overflow: "hidden",
    width: "100%",
  },
  sizeSm: {
    height: 44,
  },
  sizeMd: {
    height: 52,
  },
  sizeLg: {
    height: 58,
  },
  borderSecondary: {
    borderWidth: 1.5,
    borderColor: Colors.brand.primary,
  },
  borderLight: {
    borderWidth: 1,
    borderColor: Colors.ink[200],
  },
  primaryShadow: {
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconWrap: {
    marginRight: 8,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
