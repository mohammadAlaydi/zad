import { View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/theme/colors";
import { useHaptic } from "@/hooks/useHaptic";

type Tab = { route: string; icon: keyof typeof Ionicons.glyphMap; key: string };

export function BottomTabBar({ state }: any) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const haptic = useHaptic();

  const tabs: Tab[] = [
    { route: "/(tabs)/home", icon: "home", key: "home" },
    { route: "/(tabs)/accounts", icon: "wallet", key: "accounts" },
    { route: "/(tabs)/expenses", icon: "stats-chart", key: "expenses" },
    { route: "/(tabs)/settings", icon: "settings-sharp", key: "settings" },
  ];

  const active = state?.index ?? 0;

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + 14,
        left: 18,
        right: 18,
        height: 66,
        borderRadius: 36,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        shadowColor: "#4B1F8A",
        shadowOpacity: 0.18,
        shadowRadius: 26,
        shadowOffset: { width: 0, height: 12 },
        elevation: 14,
      }}
    >
      {tabs.map((tab, i) => {
        const focused = i === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => {
              haptic.selection();
              router.replace(tab.route as any);
            }}
            style={{ flex: focused ? 1.6 : 1, alignItems: "center", justifyContent: "center", height: "100%" }}
          >
            <MotiView
              animate={{ backgroundColor: focused ? Colors.brand.primary : "transparent" }}
              transition={{ type: "timing", duration: 240 }}
              style={{
                flexDirection: "row", alignItems: "center",
                paddingHorizontal: focused ? 18 : 12, paddingVertical: 11,
                borderRadius: 999, gap: 7,
                shadowColor: focused ? Colors.brand.primary : "transparent",
                shadowOpacity: focused ? 0.32 : 0, shadowRadius: focused ? 12 : 0,
                shadowOffset: { width: 0, height: 6 }, elevation: focused ? 6 : 0,
              }}
            >
              <Ionicons name={tab.icon} size={focused ? 18 : 22} color={focused ? "#FFFFFF" : Colors.ink[400]} />
              {focused ? (
                <MotiView from={{ opacity: 0, translateX: -6 }} animate={{ opacity: 1, translateX: 0 }} transition={{ duration: 200 }}>
                  <Text style={{ color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                    {t(`tabs.${tab.key}` as any)}
                  </Text>
                </MotiView>
              ) : null}
            </MotiView>
          </Pressable>
        );
      })}
    </View>
  );
}
