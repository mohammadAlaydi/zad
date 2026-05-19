import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { CURRENCY_FLAGS } from "@/constants/currencyFlags";
import { useAccountBalance, useMyAccounts } from "@/features/wallet";
import { useHaptic } from "@/hooks/useHaptic";
import { type Currency } from "@/store/appStore";
import { Colors } from "@/theme/colors";

type Row = {
  code: string;
  name: string;
  sub: string;
  currencyKey?: Currency;
  active?: boolean;
};

function currencyName(c: string): string {
  if (c === "USD") return "US Dollar";
  if (c === "AED") return "United Arab Emirates Dirham";
  if (c === "EUR") return "Euro";
  if (c === "GBP") return "British Pound";
  return c;
}

export default function AccountDetails() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const accounts = useMyAccounts();
  // Single-account hook — we only render the user's USD wallet's balance in
  // the "active" rows below. Multi-currency users get one row each.
  const usdAccount = accounts.data?.accounts.find((a) => a.currency === "USD");
  const usdBalanceQuery = useAccountBalance(usdAccount?.id);
  const usdBalance =
    usdBalanceQuery.data === undefined
      ? 0
      : Number(BigInt(usdBalanceQuery.data.balance.amount)) / 100;

  const active: Row[] = (accounts.data?.accounts ?? []).map((a) => ({
    code: a.currency,
    name: currencyName(a.currency),
    sub:
      a.currency === "USD"
        ? `Available ${usdBalance.toLocaleString()} $`
        : `Available — ${a.currency}`,
    currencyKey: a.currency as Currency,
    active: true,
  }));

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
                borderRadius: 18,
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.ink[100],
                marginBottom: 12,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ fontSize: 28, marginRight: 14 }}>
                  {CURRENCY_FLAGS[c.code as keyof typeof CURRENCY_FLAGS]}
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
                <Ionicons name="chevron-forward" size={20} color={Colors.ink[400]} />
              </View>
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
                {CURRENCY_FLAGS[c.code as keyof typeof CURRENCY_FLAGS]}
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
