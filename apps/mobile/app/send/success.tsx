import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import { Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { SuccessIllustration } from "@/illustrations/SuccessIllustration";
import { Colors } from "@/theme/colors";

export default function SendSuccess() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { amount, mobile, contactName, message } = useLocalSearchParams<{
    amount: string;
    mobile: string;
    contactName: string;
    message: string;
  }>();
  const amt = Number(amount || 0);
  const recipient = contactName || mobile || "Roaa Ali mohamed";
  const phone = mobile || "0101663645";
  const username = "@" + recipient.replace(/\s+/g, "").toLowerCase().slice(0, 10);

  const handleShare = () => {
    router.replace("/(tabs)/home");
  };

  const now = new Date();
  const dateStr =
    now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " " +
    now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();

  return (
    <Screen scroll bg={Colors.white}>
      <View style={[styles.topSection, { paddingTop: Math.max(insets.top, 24) + 20 }]}>
        {/* Illustration */}
        <MotiView
          from={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 700, easing: Easing.out(Easing.cubic) }}
        >
          <SuccessIllustration size={180} />
        </MotiView>

        {/* Success text */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 250, duration: 500 }}
          style={styles.successTextWrap}
        >
          <Text style={styles.successLabel}>{t("send.success")}</Text>
          <Text style={styles.amountText}>$ {amt.toFixed(2).replace(".", ",")}</Text>
          <Text style={styles.totalLabel}>{t("send.totalSentMoney")}</Text>
        </MotiView>
      </View>

      {/* Sent to card */}
      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 450, duration: 500 }}
        style={styles.cardWrap}
      >
        <View style={styles.card}>
          {/* Sended to header */}
          <Text style={styles.cardSectionLabel}>{t("send.sentTo")}</Text>

          {/* Recipient row */}
          <View style={styles.recipientRow}>
            <Avatar name={recipient} size={44} />
            <View style={styles.recipientInfo}>
              <Text style={styles.recipientName}>{recipient}</Text>
              <Text style={styles.recipientPhone}>{phone}</Text>
              <Text style={styles.recipientUsername}>{username}</Text>
            </View>
          </View>

          {/* Message */}
          {message ? (
            <View style={styles.messageSection}>
              <Text style={styles.messageLabel}>Message</Text>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}
        </View>
      </MotiView>

      {/* Transaction details card */}
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
            <Text style={styles.detailValue}>S2545455454515</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("send.date")}</Text>
            <Text style={styles.detailValue}>{dateStr}</Text>
          </View>
        </View>
      </MotiView>

      {/* Share + Done buttons */}
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
  recipientUsername: {
    color: Colors.accent.green,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 1,
  },
  messageSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.ink[200],
  },
  messageLabel: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  messageText: {
    color: Colors.ink[900],
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 3,
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
