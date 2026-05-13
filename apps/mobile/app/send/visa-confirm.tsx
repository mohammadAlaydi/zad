import { router, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/appStore";
import type { VisaDirectTx } from "@/store/appStore";
import { Colors } from "@/theme/colors";

const VISA_FEE = 1.5;

export default function VisaConfirm() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { sendVisaDirect, activeCurrency } = useApp();
  const { recipientName, cardLast4, amount } = useLocalSearchParams<{
    recipientName: string;
    cardLast4: string;
    amount: string;
  }>();

  const amt = Number(amount ?? 0);
  const total = amt + VISA_FEE;
  const maskedCard = `•••• •••• •••• ${cardLast4}`;

  const handleSend = () => {
    const tx: VisaDirectTx = {
      id: "vd-" + Date.now(),
      recipientName: recipientName ?? "",
      cardLast4: cardLast4 ?? "",
      amount: amt,
      fee: VISA_FEE,
      currency: activeCurrency,
      date: new Date().toISOString(),
      status: "completed",
    };
    sendVisaDirect(tx);
    router.push({
      pathname: "/send/success",
      params: {
        amount: amount,
        contactName: recipientName,
        mobile: "",
        message: "Visa Direct Transfer",
      },
    });
  };

  return (
    <Screen bg={Colors.white}>
      <Header title="Confirm Transfer" />
      <View style={styles.content}>
        {/* Visa card graphic */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 400 }}
          style={styles.visaCard}
        >
          <View style={styles.visaCardTop}>
            <View style={styles.visaChip} />
            <Text style={styles.visaWordmark}>VISA</Text>
          </View>
          <Text style={styles.visaCardNumber}>{maskedCard}</Text>
          <Text style={styles.visaCardHolder}>{recipientName}</Text>
        </MotiView>

        {/* Details card */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, type: "timing", duration: 400 }}
          style={styles.detailsCard}
        >
          <Text style={styles.detailsTitle}>Transfer Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recipient</Text>
            <Text style={styles.detailValue}>{recipientName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Card</Text>
            <Text style={styles.detailValue}>{maskedCard}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>${amt.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fee</Text>
            <Text style={[styles.detailValue, { color: Colors.accent.green }]}>
              ${VISA_FEE.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </MotiView>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Button title="Send via Visa" onPress={handleSend} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },
  visaCard: {
    backgroundColor: "#1A1F71",
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    shadowColor: "#1A1F71",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  visaCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  visaChip: {
    width: 36,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#D4AF37",
  },
  visaWordmark: {
    color: Colors.white,
    fontFamily: "Sora_700Bold",
    fontSize: 22,
    letterSpacing: 3,
    fontStyle: "italic",
  },
  visaCardNumber: {
    color: Colors.white,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    letterSpacing: 2,
    marginBottom: 16,
  },
  visaCardHolder: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailsCard: {
    backgroundColor: Colors.surface.background,
    borderRadius: 16,
    padding: 16,
  },
  detailsTitle: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  detailLabel: { color: Colors.ink[500], fontFamily: "Inter_400Regular", fontSize: 13 },
  detailValue: { color: Colors.ink[900], fontFamily: "Inter_500Medium", fontSize: 13 },
  divider: { height: 1, backgroundColor: Colors.ink[200], marginVertical: 8 },
  totalLabel: { color: Colors.ink[900], fontFamily: "Inter_600SemiBold", fontSize: 14 },
  totalValue: { color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 18 },
  bottomBar: { paddingHorizontal: 18 },
});
