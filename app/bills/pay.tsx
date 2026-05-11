import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Colors } from "@/theme/colors";

export default function BillsPay() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { operator, phone } = useLocalSearchParams<{ operator: string; phone: string }>();
  const bills = [
    { id: "b1", amount: 150.25, month: "August 2025" },
    { id: "b2", amount: 150.25, month: "July 2025" },
  ];
  const [selectedBill, setSelectedBill] = useState<string>(bills[0].id);

  const selected = bills.find((b) => b.id === selectedBill) ?? bills[0];
  const fee = 1.25;
  const total = selected.amount + fee;

  return (
    <Screen bg={Colors.white}>
      <Header title={t("bills.yourBills")} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 24 }}>
        {bills.map((bill) => (
          <Pressable
            key={bill.id}
            onPress={() => setSelectedBill(bill.id)}
            style={({ pressed }) => ({
              borderRadius: 14,
              backgroundColor: Colors.white,
              borderWidth: 1,
              borderColor: selectedBill === bill.id ? Colors.brand.primary : Colors.ink[100],
              marginBottom: 10,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.brand.primary50, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="document-text-outline" size={20} color={Colors.brand.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 }}>{bill.amount.toFixed(2)} $</Text>
                <Text style={{ color: Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 12 }}>{bill.month}</Text>
              </View>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selectedBill === bill.id ? Colors.brand.primary : Colors.ink[300], alignItems: "center", justifyContent: "center" }}>
                {selectedBill === bill.id && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.brand.primary }} />}
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Bottom sheet — always visible */}
      <View style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: Colors.brand.primary,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: insets.bottom + 20,
        }}>
          <Text style={{ color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 16, marginBottom: 14 }}>{t("bills.paymentDetails")}</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", fontSize: 13 }}>{t("bills.serviceValue")}</Text>
            <Text style={{ color: "#FFFFFF", fontFamily: "Inter_500Medium", fontSize: 13 }}>{selected.amount.toFixed(2)} $</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", fontSize: 13 }}>{t("bills.serviceFee")}</Text>
            <Text style={{ color: "#FFFFFF", fontFamily: "Inter_500Medium", fontSize: 13 }}>{fee.toFixed(2)} $</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)", marginBottom: 16 }}>
            <Text style={{ color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>{t("common.total")}</Text>
            <Text style={{ color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 18 }}>{total.toFixed(2)} $</Text>
          </View>
          <Pressable
            onPress={() => router.replace("/(tabs)/home")}
            style={({ pressed }) => ({
              height: 54,
              borderRadius: 999,
              backgroundColor: Colors.white,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ color: Colors.brand.primary, fontFamily: "Inter_600SemiBold", fontSize: 16 }}>{t("common.payNow")}</Text>
          </Pressable>
        </View>
    </Screen>
  );
}
