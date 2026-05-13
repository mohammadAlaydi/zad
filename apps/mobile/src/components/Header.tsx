import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/theme/colors";

type Props = {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
  transparent?: boolean;
  onBack?: () => void;
  light?: boolean; // for dark backgrounds
};

export function Header({ title, showBack = true, right, transparent, onBack, light }: Props) {
  const insets = useSafeAreaInsets();
  const fg = light ? Colors.white : Colors.ink[900];

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 24) + 16,
          backgroundColor: transparent || light ? "transparent" : Colors.white,
        },
      ]}
    >
      <View style={styles.leftSlot}>
        {showBack ? (
          <Pressable
            hitSlop={10}
            onPress={() =>
              onBack
                ? onBack()
                : router.canGoBack()
                  ? router.back()
                  : router.replace("/(tabs)/home")
            }
            style={[
              styles.backBtn,
              { backgroundColor: light ? "rgba(255,255,255,0.12)" : Colors.ink[50] },
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={fg} />
          </Pressable>
        ) : null}
      </View>
      <Text style={[styles.title, { color: fg }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.rightSlot}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSlot: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
  },
  rightSlot: {
    minWidth: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
