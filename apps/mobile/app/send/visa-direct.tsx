import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AmountStepper } from "@/components/AmountStepper";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

export default function VisaDirect() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { balances, activeCurrency } = useApp();

  const [recipientName, setRecipientName] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [amount, setAmount] = useState(100);

  const canContinue = recipientName.trim().length > 1 && cardLast4.length === 4 && amount > 0;

  const handleContinue = () => {
    router.push({
      pathname: "/send/visa-confirm",
      params: { recipientName: recipientName.trim(), cardLast4, amount: amount.toString() },
    });
  };

  return (
    <Screen bg={Colors.white} keyboard>
      <Header title="Visa Direct" />
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Balance card */}
          <View style={styles.balanceCard}>
            <Text style={styles.flagEmoji}>🇺🇸</Text>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceName}>{activeCurrency} Balance</Text>
              <Text style={styles.balanceAvailable}>
                Available {balances[activeCurrency].toLocaleString()} $
              </Text>
            </View>
            <View style={styles.visaBadge}>
              <Text style={styles.visaBadgeText}>VISA</Text>
            </View>
          </View>

          {/* Amount */}
          <Text style={styles.sectionLabel}>How much?</Text>
          <AmountStepper value={amount} onChange={setAmount} />

          {/* Fee notice */}
          <View style={styles.feeRow}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.ink[400]} />
            <Text style={styles.feeText}>Fee: $1.50 per transfer</Text>
          </View>

          {/* Recipient details */}
          <Text style={styles.sectionLabel}>Recipient Details</Text>
          <Input
            placeholder="Recipient full name"
            value={recipientName}
            onChangeText={setRecipientName}
            leftIcon={<Ionicons name="person-outline" size={18} color={Colors.ink[400]} />}
            containerStyle={styles.inputGap}
          />
          <Input
            placeholder="Last 4 digits of their Visa card"
            value={cardLast4}
            onChangeText={(v) => setCardLast4(v.replace(/\D/g, "").slice(0, 4))}
            keyboardType="numeric"
            maxLength={4}
            leftIcon={<Ionicons name="card-outline" size={18} color={Colors.ink[400]} />}
            containerStyle={styles.inputGap}
          />

          {/* Info box */}
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.brand.primary} />
            <Text style={styles.infoText}>
              Funds are delivered directly to the recipient's Visa card, typically within minutes.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Button title="Continue" disabled={!canContinue} onPress={handleContinue} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  scroll: { paddingHorizontal: 18, paddingTop: 4 },
  balanceCard: {
    backgroundColor: Colors.surface.background,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  flagEmoji: { fontSize: 28, marginRight: 10 },
  balanceInfo: { flex: 1 },
  balanceName: { color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 },
  balanceAvailable: {
    color: Colors.accent.green,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  visaBadge: {
    backgroundColor: "#1A1F71",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  visaBadgeText: {
    color: Colors.white,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: 1,
  },
  sectionLabel: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 14,
  },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    marginBottom: 28,
  },
  feeText: { color: Colors.ink[400], fontFamily: "Inter_400Regular", fontSize: 13 },
  inputGap: { marginBottom: 12 },
  infoBox: {
    backgroundColor: Colors.brand.primary50,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    color: Colors.brand.primary,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  bottomBar: { paddingHorizontal: 18 },
});
