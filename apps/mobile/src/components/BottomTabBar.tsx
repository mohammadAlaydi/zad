import { View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/theme/colors";
import { useHaptic } from "@/hooks/useHaptic";

type Tab = {
  route: string;
  iconInactive: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  key: string;
};

export function BottomTabBar({ state }: any) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const haptic = useHaptic();

  const tabs: Tab[] = [
    { route: "/(tabs)/home",     iconInactive: "home-outline",    iconActive: "home",        key: "home" },
    { route: "/(tabs)/accounts", iconInactive: "wallet-outline",  iconActive: "wallet",      key: "accounts" },
    { route: "/(tabs)/expenses", iconInactive: "stats-chart-outline", iconActive: "stats-chart", key: "expenses" },
    { route: "/(tabs)/settings", iconInactive: "settings-outline", iconActive: "settings",   key: "settings" },
  ];

  const active = state?.index ?? 0;

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + 12,
        left: 16,
        right: 16,
        height: 62,
        borderRadius: 34,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        shadowColor: "#3A1670",
        shadowOpacity: 0.14,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 10 },
        elevation: 12,
      }}
    >
      {tabs.map((tab, i) => {
        const focused = i === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => { haptic.selection(); router.replace(tab.route as any); }}
            style={{
              flex: focused ? 2 : 1,
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <MotiView
              animate={{ backgroundColor: focused ? Colors.brand.primary : "transparent" }}
              transition={{ type: "timing", duration: 220 }}
              style={{
                borderRadius: 999,
                paddingHorizontal: focused ? 12 : 0,
                paddingVertical: 8,
              }}
            >
              {/* Inner View prevents Pressable flex issues on Android */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center" }}>
                <Ionicons
                  name={focused ? tab.iconActive : tab.iconInactive}
                  size={19}
                  color={focused ? "#FFFFFF" : Colors.ink[400]}
                />
                {focused ? (
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                    }}
                    numberOfLines={1}
                  >
                    {t(`tabs.${tab.key}` as any)}
                  </Text>
                ) : null}
              </View>
            </MotiView>
          </Pressable>
        );
      })}
    </View>
  );
}
