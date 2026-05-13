import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AmountStepper } from "@/components/AmountStepper";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function AgentConfirm() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { cashInAgent, cashOutAgent, activeCurrency } = useApp();
  const { agentId, agentName, mode, floatLimit } = useLocalSearchParams<{
    agentId: string;
    agentName: string;
    mode: string;
    floatLimit: string;
  }>();

  const [amount, setAmount] = useState(100);
  const [otp] = useState<string>(generateOTP);

  const isCashIn = mode === "cashin";
  const modeLabel = isCashIn ? "Cash In" : "Cash Out";
  const maxAmount = Number(floatLimit ?? 5000);

  const handleConfirm = () => {
    const clampedAmount = Math.min(amount, maxAmount);
    if (isCashIn) {
      cashInAgent(agentId ?? "", clampedAmount, activeCurrency);
    } else {
      cashOutAgent(agentId ?? "", clampedAmount, activeCurrency);
    }
    router.push({
      pathname: "/agent/success",
      params: { agentName, mode, amount: clampedAmount.toString() },
    });
  };

  return (
    <Screen bg={Colors.white} scroll>
      <Header title={`Confirm ${modeLabel}`} />
      <View style={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        {/* Agent info */}
        <View style={styles.agentCard}>
          <View style={styles.agentAvatar}>
            <Text style={styles.agentAvatarText}>{(agentName ?? "A").charAt(0)}</Text>
          </View>
          <View style={styles.agentInfo}>
            <Text style={styles.agentName}>{agentName}</Text>
            <View style={styles.modePill}>
              <Ionicons
                name={isCashIn ? "arrow-down-circle" : "arrow-up-circle"}
                size={14}
                color={isCashIn ? Colors.accent.green : Colors.accent.red}
              />
              <Text
                style={[
                  styles.modePillText,
                  { color: isCashIn ? Colors.accent.green : Colors.accent.red },
                ]}
              >
                {modeLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* Amount */}
        <Text style={styles.sectionLabel}>Amount</Text>
        <AmountStepper
          value={amount}
          onChange={(v) => setAmount(Math.min(v, maxAmount))}
          step={50}
        />
        <Text style={styles.limitNote}>Max: ${maxAmount.toLocaleString()} float limit</Text>

        {/* Warning */}
        <View style={styles.warningBox}>
          <Ionicons name="information-circle" size={20} color={Colors.accent.amber} />
          <Text style={styles.warningText}>
            Show this screen to the agent and complete the OTP verification below.
          </Text>
        </View>

        {/* OTP display */}
        <MotiView
          from={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 500 }}
          style={styles.otpCard}
        >
          <Text style={styles.otpLabel}>Your OTP Code</Text>
          <View style={styles.otpDigits}>
            {otp.split("").map((digit, i) => (
              <View key={i} style={styles.otpBox}>
                <Text style={styles.otpDigit}>{digit}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.otpNote}>
            Share this code with the agent to complete the transaction
          </Text>
        </MotiView>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Button title={`Confirm ${modeLabel}`} onPress={handleConfirm} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingTop: 4 },
  agentCard: {
    backgroundColor: Colors.surface.background,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  agentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  agentAvatarText: { color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 20 },
  agentInfo: { flex: 1 },
  agentName: {
    color: Colors.ink[900],
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    marginBottom: 4,
  },
  modePill: { flexDirection: "row", alignItems: "center", gap: 5 },
  modePillText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  sectionLabel: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 14,
  },
  limitNote: {
    color: Colors.ink[400],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  warningBox: {
    backgroundColor: "#FFF8EC",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F2B44133",
  },
  warningText: {
    flex: 1,
    color: Colors.ink[700],
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  otpCard: {
    backgroundColor: Colors.surface.background,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.ink[200],
  },
  otpLabel: {
    color: Colors.ink[500],
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  otpDigits: { flexDirection: "row", gap: 10, marginBottom: 14 },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  otpDigit: { color: Colors.brand.primary, fontFamily: "Sora_700Bold", fontSize: 22 },
  otpNote: {
    color: Colors.ink[400],
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  bottomBar: { paddingHorizontal: 18 },
});
