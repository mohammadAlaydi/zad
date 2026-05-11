import { View, Text, Pressable, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { useApp, Currency } from "@/store/appStore";
import { Colors } from "@/theme/colors";
import { useHaptic } from "@/hooks/useHaptic";

const FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  AED: "🇦🇪",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
};

type Row = {
  code: string;
  name: string;
  sub: string;
  currencyKey?: Currency;
  active?: boolean;
};

export default function AccountDetails() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const { balances } = useApp();

  const active: Row[] = [
    {
      code: "USD",
      name: "US Dollar",
      sub: `Available ${balances.USD.toLocaleString()} $`,
      currencyKey: "USD",
      active: true,
    },
    {
      code: "AED",
      name: "United Arab Emirates Dirham",
      sub: `Available ${balances.AED.toLocaleString()} AED`,
      currencyKey: "AED",
      active: true,
    },
  ];

  const others: Row[] = [
    { code: "AUD", name: "Austrian Dollar", sub: "AUD" },
    { code: "CAD", name: "Canadian Dollar", sub: "Cad" },
    { code: "AUD", name: "Austrian Dollar", sub: "AUD" },
    { code: "CAD", name: "Canadian Dollar", sub: "Cad" },
    { code: "AUD", name: "Austrian Dollar", sub: "AUD" },
    { code: "CAD", name: "Canadian Dollar", sub: "Cad" },
  ];

  return (
    <Screen bg={Colors.white}>
      <Header title={t("settings.accountDetails")} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 320 }}
        >
          <Text
            style={{
              color: Colors.brand.primary,
              fontFamily: "Sora_700Bold",
              fontSize: 22,
              marginBottom: 4,
            }}
          >
            {t("profile.accountsDetails")}
          </Text>
          <Text
            style={{
              color: Colors.ink[500],
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Add Your used Currency
          </Text>
        </MotiView>

        {/* Active accounts */}
        {active.map((c, i) => (
          <MotiView
            key={c.code + i}
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 80 * i, duration: 320 }}
          >
            <Pressable
              onPress={() => haptic.selection()}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderRadius: 18,
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.ink[100],
                marginBottom: 12,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontSize: 28, marginRight: 14 }}>
                {FLAGS[c.code]}
              </Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: Colors.ink[900],
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                  }}
                >
                  {c.name}
                </Text>
                <Text
                  style={{
                    marginTop: 2,
                    color: Colors.accent.green,
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                  }}
                >
                  {c.sub}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.ink[400]}
              />
            </Pressable>
          </MotiView>
        ))}

        <View style={{ height: 14 }} />

        {/* Other currencies */}
        {others.map((c, i) => (
          <MotiView
            key={`o-${i}`}
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 220 + i * 60, duration: 320 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 18,
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.ink[100],
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 26, marginRight: 14 }}>
                {FLAGS[c.code]}
              </Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: Colors.ink[900],
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                  }}
                >
                  {c.name}
                </Text>
                <Text
                  style={{
                    color: Colors.ink[400],
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    marginTop: 1,
                  }}
                >
                  {c.sub}
                </Text>
              </View>
              <Pressable
                onPress={() => haptic.light()}
                style={({ pressed }) => ({
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: Colors.brand.primary,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: Colors.brand.primary,
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                  }}
                >
                  {t("common.add")}
                </Text>
              </Pressable>
            </View>
          </MotiView>
        ))}
      </ScrollView>
    </Screen>
  );
}
