import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import { Easing } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { Colors } from "@/theme/colors";

interface FailureCopy {
  title: string;
  body: string;
  // Whether retrying makes sense for this failure mode.
  allowRetry: boolean;
}

function copyFor(code: string | undefined): FailureCopy {
  switch (code) {
    case "WALLET.INSUFFICIENT_BALANCE":
      return {
        title: "Insufficient balance",
        body: "You don't have enough funds to cover this transfer. Top up your wallet and try again.",
        allowRetry: true,
      };
    case "WALLET.RECIPIENT_NOT_FOUND":
    case "IDENTITY.RECIPIENT_NOT_FOUND":
      return {
        title: "Recipient not found",
        body: "No ZADPAY user has registered with that phone number.",
        allowRetry: true,
      };
    case "WALLET.SAME_ACCOUNT_TRANSFER":
      return {
        title: "Can't send to yourself",
        body: "Pick a different recipient phone number.",
        allowRetry: true,
      };
    case "WALLET.CURRENCY_MISMATCH":
      return {
        title: "Currency mismatch",
        body: "The recipient's wallet uses a different currency.",
        allowRetry: false,
      };
    case "WALLET.INVALID_AMOUNT":
      return {
        title: "Invalid amount",
        body: "Enter a positive amount greater than zero.",
        allowRetry: true,
      };
    case "WALLET.PROCESSOR_REJECTED":
      return {
        title: "Payment rejected",
        body: "The payment couldn't be completed. Please try again later.",
        allowRetry: true,
      };
    case "COMMON.NETWORK":
      return {
        title: "Connection lost",
        body: "We couldn't reach ZADPAY. Check your connection and try again.",
        allowRetry: true,
      };
    default:
      return {
        title: "Couldn't send money",
        body: "Something went wrong. Please try again.",
        allowRetry: true,
      };
  }
}

export default function SendFailure() {
  const { t: _t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { code, amount, recipient } = useLocalSearchParams<{
    code: string;
    amount: string;
    recipient: string;
  }>();
  const copy = copyFor(code);
  const amountDisplay = Number(amount || 0).toFixed(2);
  const recipientName = recipient ?? "the recipient";

  return (
    <Screen scroll bg={Colors.white}>
      <View style={[styles.topSection, { paddingTop: Math.max(insets.top, 24) + 20 }]}>
        {/* Error icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 600, easing: Easing.out(Easing.cubic) }}
          style={styles.iconCircle}
        >
          <Ionicons name="close" size={60} color={Colors.accent.red} />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, duration: 500 }}
          style={styles.successTextWrap}
        >
          <Text style={styles.label}>Transfer failed</Text>
          <Text style={styles.title}>{copy.title}</Text>
        </MotiView>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 350, duration: 500 }}
        style={styles.cardWrap}
      >
        <View style={styles.card}>
          <Text style={styles.body}>{copy.body}</Text>
        </View>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 500, duration: 500 }}
        style={styles.cardWrap}
      >
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>${amountDisplay}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recipient</Text>
            <Text style={styles.detailValue}>{recipientName}</Text>
          </View>
          <View style={[styles.detailRow, { marginBottom: 0 }]}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, { color: Colors.accent.red }]}>Not sent</Text>
          </View>
        </View>
      </MotiView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        {copy.allowRetry && (
          <>
            <Button title="Try again" onPress={() => router.replace("/send")} />
            <View style={{ height: 10 }} />
          </>
        )}
        <Button
          title="Back to home"
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
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FBEAEC",
    alignItems: "center",
    justifyContent: "center",
  },
  successTextWrap: {
    alignItems: "center",
    marginTop: 24,
  },
  label: {
    color: Colors.accent.red,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 8,
  },
  title: {
    color: Colors.ink[900],
    fontFamily: "Sora_700Bold",
    fontSize: 26,
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
  body: {
    color: Colors.ink[700],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
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
    fontSize: 13,
  },
  bottomBar: {
    paddingHorizontal: 18,
    paddingTop: 28,
  },
});
