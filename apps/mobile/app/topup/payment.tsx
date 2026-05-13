import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

export default function TopUpPayment() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { amount } = useLocalSearchParams<{ amount: string }>();
  const { cards } = useApp();
  const [selected, setSelected] = useState<string | null>(cards[0]?.id ?? null);
  const [tab, setTab] = useState<"cards" | "banks">("cards");

  return (
    <Screen bg={Colors.white}>
      <Header title={t("topup.choosePayment")} />
      <View style={{ flex: 1, paddingHorizontal: 18 }}>
        {/* Tabs */}
        <View style={{ flexDirection: "row", marginBottom: 18, borderBottomWidth: 1, borderBottomColor: Colors.ink[100] }}>
          {(["cards", "banks"] as const).map((key) => (
            <Pressable key={key} onPress={() => setTab(key)} style={{ flex: 1, alignItems: "center", paddingVertical: 10, borderBottomWidth: key === tab ? 2 : 0, borderBottomColor: Colors.brand.primary }}>
              <Text style={{ color: key === tab ? Colors.brand.primary : Colors.ink[400], fontFamily: key === tab ? "Inter_600SemiBold" : "Inter_400Regular", fontSize: 13 }}>
                {key === "cards" ? t("cards.myCards") : "Banks"}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === "cards" && cards.map((card) => (
          <Pressable
            key={card.id}
            onPress={() => setSelected(card.id)}
            style={({ pressed }) => ({
              backgroundColor: Colors.white,
              borderRadius: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: selected === card.id ? Colors.brand.primary : Colors.ink[100],
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center", padding: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#EB001B", alignItems: "center", justifyContent: "center", marginRight: 12, overflow: "hidden" }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#F79E1B", position: "absolute", right: 6 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}>{t("topup.masterCard")}</Text>
                <Text style={{ color: Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 12 }}>**** **** **** {card.last4}</Text>
              </View>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected === card.id ? Colors.brand.primary : Colors.ink[300], alignItems: "center", justifyContent: "center" }}>
                {selected === card.id && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.brand.primary }} />}
              </View>
            </View>
          </Pressable>
        ))}

        <Pressable
          onPress={() => router.push("/topup/add-card")}
          style={({ pressed }) => ({
            height: 56,
            borderRadius: 999,
            borderWidth: 1.5,
            borderColor: Colors.ink[200],
            marginTop: 8,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, flex: 1 }}>
            <Ionicons name="card-outline" size={20} color={Colors.ink[700]} />
            <Text style={{ color: Colors.ink[700], fontFamily: "Inter_500Medium", fontSize: 14 }}>{t("topup.addNewCard")}</Text>
          </View>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 16 }}>
        <Button title={t("common.continue")} onPress={() => router.push({ pathname: "/topup/confirm", params: { amount: amount.toString(), cardId: selected ?? cards[0]?.id ?? "card1" } })} />
      </View>
    </Screen>
  );
}
