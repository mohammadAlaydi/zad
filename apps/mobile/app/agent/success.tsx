import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Colors } from "@/theme/colors";

export default function AgentSuccess() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { agentName, mode, amount } = useLocalSearchParams<{
    agentName: string;
    mode: string;
    amount: string;
  }>();

  const reference = useMemo(() => `AGT-${Date.now()}`, []);
  const isCashIn = mode === "cashin";
  const modeLabel = isCashIn ? "Cash In" : "Cash Out";
  const amt = Number(amount ?? 0);

  const now = new Date();
  const dateStr =
    now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " " +
    now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();

  return (
    <Screen bg={Colors.white} scroll>
      <View style={[styles.topSection, { paddingTop: Math.max(insets.top, 24) + 20 }]}>
        {/* Checkmark */}
        <MotiView
          from={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 180 }}
          style={styles.iconWrap}
        >
          <Ionicons name="checkmark-circle" size={80} color={Colors.accent.green} />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 250, type: "timing", duration: 450, easing: Easing.out(Easing.cubic) }}
          style={styles.headingWrap}
        >
          <Text style={styles.successHeading}>Transaction Complete!</Text>
          <Text style={styles.amountText}>
            {isCashIn ? "+" : "-"}${amt.toFixed(2)}
          </Text>
          <Text style={styles.modeLabel}>{modeLabel} via Agent</Text>
        </MotiView>
      </View>

      {/* Details card */}
      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 420, type: "timing", duration: 450 }}
        style={styles.cardWrap}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transaction Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Agent</Text>
            <Text style={styles.detailValue}>{agentName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <View style={[styles.typeBadge, { backgroundColor: isCashIn ? Colors.accent.greenSoft : Colors.accent.redSoft }]}>
              <Text style={[styles.typeBadgeText, { color: isCashIn ? Colors.accent.green : Colors.accent.red }]}>
                {modeLabel}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={[styles.detailValue, { color: isCashIn ? Colors.accent.green : Colors.accent.red }]}>
              {isCashIn ? "+" : "-"}${amt.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference</Text>
            <Text style={[styles.detailValue, { color: Colors.brand.primary }]}>{reference}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{dateStr}</Text>
          </View>
        </View>
      </MotiView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        <Button
          title="Done"
          onPress={() => router.push("/(tabs)/home")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topSection: { alignItems: "center", paddingHorizontal: 24, paddingBottom: 8 },
  iconWrap: { marginBottom: 16 },
  headingWrap: { alignItems: "center" },
  successHeading: {
    color: Colors.ink[900],
    fontFamily: "Sora_700Bold",
    fontSize: 22,
    marginBottom: 10,
  },
  amountText: {
    color: Colors.ink[900],
    fontFamily: "Sora_700Bold",
    fontSize: 38,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  modeLabel: {
    color: Colors.ink[500],
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  cardWrap: { paddingHorizontal: 18, marginTop: 20 },
  card: {
    backgroundColor: Colors.surface.background,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
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
  typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  typeBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  divider: { height: 1, backgroundColor: Colors.ink[200], marginVertical: 8 },
  bottomBar: { paddingHorizontal: 18, paddingTop: 24 },
});
