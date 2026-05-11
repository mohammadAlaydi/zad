import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";
import { useHaptic } from "@/hooks/useHaptic";

export default function TopUp() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const { balances, activeCurrency } = useApp();
  const [amount, setAmount] = useState(200);

  const quickAmounts = [100, 200, 300, 400, 500, 600, 700, 800];

  return (
    <Screen bg={Colors.white}>
      <Header title={t("topup.title")} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 120 }}>
        <View style={{ backgroundColor: Colors.surface.background, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", marginBottom: 22 }}>
          <Text style={{ fontSize: 22, marginRight: 10 }}>USD</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
              {activeCurrency} Balance
            </Text>
            <Text style={{ color: Colors.accent.green, fontFamily: "Inter_500Medium", fontSize: 12 }}>
              Available {balances[activeCurrency].toLocaleString()} $
            </Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/accounts")} hitSlop={8}>
            <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
              {t("common.change")}
            </Text>
          </Pressable>
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={{ alignItems: "center", marginVertical: 26 }}
        >
          <Text style={{ color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 44, letterSpacing: -0.5 }}>
            $ {amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </MotiView>

        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
          {quickAmounts.map((v) => {
            const active = amount === v;
            return (
              <Pressable
                key={v}
                onPress={() => { haptic.selection(); setAmount(v); }}
                style={({ pressed }) => ({
                  width: "23%", paddingVertical: 14, borderRadius: 12,
                  backgroundColor: active ? Colors.brand.primary : Colors.white,
                  borderWidth: 1.5, borderColor: active ? Colors.brand.primary : Colors.ink[200],
                  alignItems: "center", opacity: pressed ? 0.85 : 1,
                  shadowColor: active ? Colors.brand.primary : "transparent",
                  shadowOpacity: active ? 0.25 : 0, shadowRadius: active ? 10 : 0, shadowOffset: { width: 0, height: 4 },
                })}
              >
                <Text style={{ color: active ? "#FFFFFF" : Colors.ink[800], fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                  ${v}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 26 }}>
          <Pressable
            onPress={() => { haptic.selection(); setAmount(Math.max(0, amount - 50)); }}
            style={({ pressed }) => ({
              width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.brand.primary50,
              alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="remove" size={22} color={Colors.brand.primary} />
          </Pressable>
          <Text style={{ color: Colors.ink[500], fontFamily: "Inter_500Medium", fontSize: 13 }}>Adjust by $50</Text>
          <Pressable
            onPress={() => { haptic.selection(); setAmount(amount + 50); }}
            style={({ pressed }) => ({
              width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.brand.primary50,
              alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="add" size={22} color={Colors.brand.primary} />
          </Pressable>
        </View>
      </ScrollView>

      <View style={{ position: "absolute", left: 18, right: 18, bottom: insets.bottom + 12 }}>
        <Button
          title={t("common.continue")}
          onPress={() => router.push({ pathname: "/topup/payment", params: { amount: (amount > 0 ? amount : 200).toString() } })}
        />
      </View>
    </Screen>
  );
}
