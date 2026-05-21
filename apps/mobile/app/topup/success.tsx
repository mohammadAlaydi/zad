import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet, Share } from "react-native";
import { Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { SuccessIllustration } from "@/illustrations/SuccessIllustration";
import { Colors } from "@/theme/colors";

export default function TopUpSuccess() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { amount, currency, cardLast4, transactionId } = useLocalSearchParams<{
    amount: string;
    currency: string;
    cardLast4: string;
    transactionId: string;
  }>();
  const amt = Number(amount || 0);
  const ref = transactionId ? transactionId.replace(/-/g, "").slice(-8).toUpperCase() : "—";
  const last4 = cardLast4 || "";

  const now = new Date();
  const dateStr =
    now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " " +
    now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();

  const handleShare = async () => {
    const body = `I topped up ${amt.toFixed(2)} ${currency || ""} to my ZADPay wallet.\nReference: ${ref}`;
    try {
      await Share.share({ message: body });
    } catch {
      // user dismissed
    }
  };

  return (
    <Screen scroll bg={Colors.white}>
      <View style={[styles.topSection, { paddingTop: Math.max(insets.top, 24) + 20 }]}>
        <MotiView
          from={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 700, easing: Easing.out(Easing.cubic) }}
        >
          <SuccessIllustration size={180} />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 250, duration: 500 }}
          style={styles.successTextWrap}
        >
          <Text style={styles.successLabel}>{t("topup.success")}</Text>
          <Text style={styles.amountText}>
            {amt.toFixed(2)} {currency || ""}
          </Text>
          <Text style={styles.totalLabel}>{t("topup.totalToppedUp")}</Text>
        </MotiView>
      </View>

      {/* Source card */}
      {last4 !== "" && (
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 450, duration: 500 }}
          style={styles.cardWrap}
        >
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>{t("topup.addedFrom")}</Text>
            <View style={styles.recipientRow}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="card-outline" size={22} color={Colors.brand.primary} />
              </View>
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientName}>{t("topup.masterCard")}</Text>
                <Text style={styles.recipientPhone}>•••• {last4}</Text>
              </View>
            </View>
          </View>
        </MotiView>
      )}

      {/* Transaction details */}
      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 600, duration: 500 }}
        style={styles.cardWrap}
      >
        <View style={styles.card}>
          <Text style={styles.detailsTitle}>{t("send.transferDetails")}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("send.reference")}</Text>
            <Text style={styles.detailValue}>{ref}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("send.date")}</Text>
            <Text style={styles.detailValue}>{dateStr}</Text>
          </View>
        </View>
      </MotiView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        <Button
          title={t("send.share")}
          icon={<Ionicons name="share-social-outline" size={18} color={Colors.white} />}
          onPress={handleShare}
        />
        <View style={{ height: 10 }} />
        <Button
          title={t("common.done")}
          variant="secondary"
          onPress={() => router.replace("/(tabs)/home")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topSection: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successTextWrap: {
    alignItems: "center",
    marginTop: 8,
  },
  successLabel: {
    color: Colors.accent.green,
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginBottom: 6,
  },
  amountText: {
    color: Colors.ink[900],
    fontFamily: "Sora_700Bold",
    fontSize: 38,
    letterSpacing: -0.5,
  },
  totalLabel: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  cardWrap: {
    paddingHorizontal: 18,
    marginTop: 16,
  },
  card: {
    backgroundColor: Colors.surface.background,
    borderRadius: 16,
    padding: 16,
  },
  cardSectionLabel: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginBottom: 12,
  },
  recipientRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
  },
  recipientInfo: {
    marginLeft: 12,
    flex: 1,
  },
  recipientName: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  recipientPhone: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 1,
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
    marginBottom: 10,
  },
  detailLabel: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  detailValue: {
    color: Colors.ink[900],
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  bottomBar: {
    paddingHorizontal: 18,
    paddingTop: 24,
  },
});
