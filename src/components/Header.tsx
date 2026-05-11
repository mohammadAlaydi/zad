import { View, Text, Pressable, ViewStyle } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/theme/colors";

type Props = {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
  transparent?: boolean;
  onBack?: () => void;
  style?: ViewStyle;
  light?: boolean; // for dark backgrounds
};

export function Header({ title, showBack = true, right, transparent, onBack, style, light }: Props) {
  const insets = useSafeAreaInsets();
  const fg = light ? Colors.white : Colors.ink[900];

  return (
    <View
      style={[
        {
          paddingTop: insets.top + 6,
          paddingBottom: 10,
          paddingHorizontal: 18,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: transparent ? "transparent" : light ? "transparent" : Colors.white,
        },
        style,
      ]}
    >
      <View style={{ width: 40, height: 40, alignItems: "flex-start", justifyContent: "center" }}>
        {showBack ? (
          <Pressable
            hitSlop={10}
            onPress={() => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace("/(tabs)/home"))}
            style={({ pressed }) => [
              {
                width: 40,
                height: 40,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: light ? "rgba(255,255,255,0.12)" : Colors.ink[50],
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={fg} />
          </Pressable>
        ) : null}
      </View>
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 17, color: fg }} numberOfLines={1}>
        {title}
      </Text>
      <View style={{ width: 40, height: 40, alignItems: "flex-end", justifyContent: "center" }}>{right}</View>
    </View>
  );
}
