import { useState, useCallback } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";
import { useHaptic } from "@/hooks/useHaptic";

const QUICK_AMOUNTS = [100, 200, 300, 400, 500, 600, 700, 800];

export default function TopUp() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();
  const { balances, activeCurrency } = useApp();
  const [amount, setAmount] = useState(200);
  const [inputText, setInputText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const formatted = amount
    .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(".", ",");

  const handleInputChange = useCallback((text: string) => {
    // Allow only digits and one dot/comma
    const cleaned = text.replace(/[^0-9.,]/g, "").replace(",", ".");
    setInputText(text);
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num >= 0) {
      setAmount(num);
    } else if (cleaned === "" || cleaned === ".") {
      setAmount(0);
    }
  }, []);

  const handleFocus = useCallback(() => {
    setIsEditing(true);
    setInputText(amount > 0 ? amount.toString() : "");
  }, [amount]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  return (
    <Screen bg={Colors.white} keyboard>
      <Header title={t("topup.title")} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>To your</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.flagEmoji}>🇺🇸</Text>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceName}>{activeCurrency} Balance</Text>
              <Text style={styles.balanceAvailable}>
                Available {balances[activeCurrency].toLocaleString()}$
              </Text>
            </View>
            <Pressable onPress={() => router.push("/(tabs)/accounts")} hitSlop={8}>
              <Text style={styles.changeLink}>{t("common.change")}</Text>
            </Pressable>
          </View>
        </View>

        {/* Section title */}
        <Text style={styles.sectionTitle}>
          {t("topup.youWillTopUp") || "How much you would like to Top up"}
        </Text>

        {/* Amount stepper row: - amount + */}
        <View style={styles.stepperRow}>
          <Pressable
            onPress={() => {
              haptic.selection();
              setAmount(Math.max(0, amount - 50));
            }}
            style={styles.stepperBtn}
          >
            <Ionicons name="remove" size={22} color={Colors.brand.primary} />
          </Pressable>

          <View style={styles.amountWrap}>
            <Text style={styles.amountDollar}>$ </Text>
            <TextInput
              style={styles.amountInput}
              value={isEditing ? inputText : formatted}
              onChangeText={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              keyboardType="decimal-pad"
              selectTextOnFocus
              placeholder="0,00"
              placeholderTextColor={Colors.ink[300]}
            />
          </View>

          <Pressable
            onPress={() => {
              haptic.selection();
              setAmount(amount + 50);
            }}
            style={styles.stepperBtn}
          >
            <Ionicons name="add" size={22} color={Colors.brand.primary} />
          </Pressable>
        </View>

        {/* Quick amounts grid (4 columns x 2 rows) */}
        <View style={styles.quickGrid}>
          {QUICK_AMOUNTS.map((v) => {
            const active = amount === v;
            return (
              <Pressable
                key={v}
                onPress={() => {
                  haptic.selection();
                  setAmount(v);
                }}
                style={[
                  styles.quickChip,
                  active ? styles.quickChipActive : null,
                ]}
              >
                <Text style={[styles.quickChipText, active ? styles.quickChipTextActive : null]}>
                  ${v}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue button — fixed at bottom */}
      <View style={[styles.bottomBar, { bottom: insets.bottom + 12 }]}>
        <Button
          title={t("common.continue")}
          disabled={amount <= 0}
          onPress={() =>
            router.push({
              pathname: "/topup/payment",
              params: { amount: amount.toString() },
            })
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 18,
  },
  // Balance card
  balanceCard: {
    backgroundColor: Colors.surface.background,
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
  },
  balanceLabel: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceName: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  balanceAvailable: {
    color: Colors.accent.green,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 1,
  },
  changeLink: {
    color: Colors.brand.primary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  // Section title
  sectionTitle: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  // Amount stepper
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 28,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
  },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
  },
  amountDollar: {
    color: Colors.brand.primary,
    fontFamily: "Sora_700Bold",
    fontSize: 36,
    letterSpacing: -0.5,
  },
  amountInput: {
    color: Colors.brand.primary,
    fontFamily: "Sora_700Bold",
    fontSize: 36,
    letterSpacing: -0.5,
    padding: 0,
    minWidth: 100,
    textAlign: "center",
  },
  // Quick amounts grid
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  quickChip: {
    width: "23%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    alignItems: "center",
  },
  quickChipActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  quickChipText: {
    color: Colors.ink[800],
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  quickChipTextActive: {
    color: "#FFFFFF",
  },
  // Bottom
  bottomBar: {
    position: "absolute",
    left: 18,
    right: 18,
  },
});
