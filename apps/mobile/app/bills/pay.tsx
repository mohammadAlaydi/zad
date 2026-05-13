import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
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
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {bills.map((bill) => {
          const isActive = selectedBill === bill.id;
          return (
            <Pressable
              key={bill.id}
              onPress={() => setSelectedBill(bill.id)}
              style={[
                styles.billRow,
                {
                  borderColor: isActive ? Colors.brand.primary : Colors.ink[100],
                },
              ]}
            >
              <View style={styles.billIcon}>
                <Ionicons name="document-text-outline" size={20} color={Colors.brand.primary} />
              </View>
              <View style={styles.billInfo}>
                <Text style={styles.billAmount}>{bill.amount.toFixed(2)} $</Text>
                <Text style={styles.billMonth}>{bill.month}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: isActive ? Colors.brand.primary : Colors.ink[300],
                  },
                ]}
              >
                {isActive ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Bottom sheet */}
      {selected && (
        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}>
          <Text style={styles.sheetTitle}>{t("bills.paymentDetails")}</Text>
          <View style={styles.sheetRow}>
            <Text style={styles.sheetLabel}>{t("bills.serviceValue")}</Text>
            <Text style={styles.sheetValue}>{selected.amount.toFixed(2)} $</Text>
          </View>
          <View style={styles.sheetRow}>
            <Text style={styles.sheetLabel}>{t("bills.serviceFee")}</Text>
            <Text style={styles.sheetValue}>{fee.toFixed(2)} $</Text>
          </View>
          <View style={styles.sheetTotalRow}>
            <Text style={styles.sheetTotalLabel}>{t("common.total")}</Text>
            <Text style={styles.sheetTotalValue}>{total.toFixed(2)} $</Text>
          </View>
          <Pressable onPress={() => router.replace("/(tabs)/home")} style={styles.payBtn}>
            <Text style={styles.payBtnText}>{t("common.payNow")}</Text>
          </Pressable>
        </View>
      )}

      {!selected && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <Button title={t("common.payNow")} disabled />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 18,
  },
  billRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    marginBottom: 10,
  },
  billIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
  },
  billAmount: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  billMonth: {
    color: Colors.ink[400],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.brand.primary,
  },
  // Bottom sheet
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.brand.primary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sheetTitle: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginBottom: 14,
  },
  sheetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetLabel: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  sheetValue: {
    color: "#FFFFFF",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  sheetTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    marginBottom: 16,
  },
  sheetTotalLabel: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  sheetTotalValue: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  payBtn: {
    height: 54,
    borderRadius: 999,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  payBtnText: {
    color: Colors.brand.primary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  bottomBar: {
    paddingHorizontal: 18,
  },
});
