import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { useApp } from "@/store/appStore";
import { Colors } from "@/theme/colors";

type ModalMode = "deposit" | "withdraw" | null;

export default function GoalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { goals, depositGoal, withdrawGoal, balances, activeCurrency } = useApp();

  const goal = goals.find((g) => g.id === id);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [raw, setRaw] = useState("");

  if (!goal) {
    return (
      <Screen bg={Colors.surface.background}>
        <Header title="Goal" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.ink[500] }}>
            Goal not found.
          </Text>
        </View>
      </Screen>
    );
  }

  const progress = goal.targetAmount > 0 ? Math.min(goal.savedAmount / goal.targetAmount, 1) : 0;
  const pct = Math.round(progress * 100);
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const amount = parseFloat(raw) || 0;
  const balance = balances[activeCurrency] ?? 0;

  function handleConfirm() {
    if (!modalMode || amount <= 0) return;
    if (modalMode === "deposit") {
      if (amount > balance) {
        Alert.alert("Insufficient balance");
        return;
      }
      depositGoal(goal.id, amount);
    } else {
      if (amount > goal.savedAmount) {
        Alert.alert("Exceeds saved amount");
        return;
      }
      withdrawGoal(goal.id, amount);
    }
    setRaw("");
    setModalMode(null);
  }

  return (
    <Screen bg={Colors.surface.background}>
      <Header title={goal.name} />

      <MotiView
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 360 }}
        style={s.heroWrap}
      >
        <LinearGradient
          colors={[Colors.brand.gradientStart, Colors.brand.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          <Text style={s.heroEmoji}>{goal.emoji}</Text>
          <Text style={s.heroName}>{goal.name}</Text>

          <View style={s.progressTrack}>
            <MotiView
              from={{ width: "0%" }}
              animate={{ width: `${pct}%` as any }}
              transition={{ type: "timing", duration: 800, delay: 200 }}
              style={s.progressFill}
            />
          </View>

          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text style={s.statVal}>{goal.currency} {goal.savedAmount.toLocaleString()}</Text>
              <Text style={s.statLbl}>Saved</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.heroStat}>
              <Text style={s.statVal}>{goal.currency} {goal.targetAmount.toLocaleString()}</Text>
              <Text style={s.statLbl}>Target</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.heroStat}>
              <Text style={s.statVal}>{pct}%</Text>
              <Text style={s.statLbl}>Complete</Text>
            </View>
          </View>
        </LinearGradient>
      </MotiView>

      {remaining > 0 && (
        <View style={s.remainingBanner}>
          <Ionicons name="flag-outline" size={15} color={Colors.brand.primary} />
          <Text style={s.remainingText}>
            {goal.currency} {remaining.toLocaleString()} more to reach your goal
          </Text>
        </View>
      )}
      {pct >= 100 && (
        <View style={[s.remainingBanner, { backgroundColor: Colors.accent.greenSoft }]}>
          <Ionicons name="checkmark-circle" size={15} color={Colors.accent.green} />
          <Text style={[s.remainingText, { color: Colors.accent.green }]}>
            🎉 Goal reached! Well done.
          </Text>
        </View>
      )}

      <View style={s.actionsRow}>
        <Pressable onPress={() => setModalMode("deposit")} style={s.depositBtn}>
          <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
          <Text style={s.depositBtnText}>Add Funds</Text>
        </Pressable>
        <Pressable onPress={() => setModalMode("withdraw")} style={s.withdrawBtn}>
          <Ionicons name="arrow-down-circle-outline" size={18} color={Colors.brand.primary} />
          <Text style={s.withdrawBtnText}>Withdraw</Text>
        </Pressable>
      </View>

      {/* Amount modal */}
      <Modal
        transparent
        animationType="slide"
        visible={!!modalMode}
        onRequestClose={() => setModalMode(null)}
      >
        <Pressable style={m.overlay} onPress={() => setModalMode(null)}>
          <Pressable style={[m.sheet, { paddingBottom: insets.bottom + 20 }]} onPress={() => {}}>
            <View style={m.handle} />
            <Text style={m.title}>
              {modalMode === "deposit" ? "Add Funds to" : "Withdraw from"} {goal.emoji} {goal.name}
            </Text>
            <Text style={m.sub}>
              {modalMode === "deposit"
                ? `Wallet balance: ${activeCurrency} ${balance.toLocaleString()}`
                : `Saved: ${goal.currency} ${goal.savedAmount.toLocaleString()}`}
            </Text>
            <View style={m.amountRow}>
              <Text style={m.cur}>{goal.currency}</Text>
              <TextInput
                style={m.input}
                placeholder="0.00"
                placeholderTextColor={Colors.ink[300]}
                value={raw}
                onChangeText={setRaw}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
            <View style={m.btns}>
              <Button
                title="Cancel"
                variant="secondary"
                size="md"
                onPress={() => { setRaw(""); setModalMode(null); }}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title={modalMode === "deposit" ? "Add" : "Withdraw"}
                size="md"
                disabled={amount <= 0}
                onPress={handleConfirm}
                style={{ flex: 1 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const s = StyleSheet.create({
  heroWrap: {
    margin: 18,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: Colors.brand.gradientEnd,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroCard: { padding: 22, borderRadius: 22 },
  heroEmoji: { fontSize: 36, marginBottom: 8 },
  heroName: { fontFamily: "Inter_600SemiBold", fontSize: 20, color: Colors.white, marginBottom: 18 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    marginBottom: 18,
  },
  progressFill: { height: "100%", borderRadius: 4, backgroundColor: "rgba(255,255,255,0.85)" },
  heroStats: { flexDirection: "row", alignItems: "center" },
  heroStat: { flex: 1, alignItems: "center" },
  statVal: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.white },
  statLbl: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.25)" },
  remainingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.brand.primary50,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 18,
    marginBottom: 20,
  },
  remainingText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.brand.primary, flex: 1 },
  actionsRow: { flexDirection: "row", gap: 12, marginHorizontal: 18 },
  depositBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.brand.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  depositBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.white },
  withdrawBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.brand.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  withdrawBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.brand.primary },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.surface.overlay, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.ink[200],
    alignSelf: "center",
    marginBottom: 20,
  },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: Colors.ink[900], marginBottom: 4 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[500], marginBottom: 16 },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.brand.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  cur: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.ink[500], marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 24,
    color: Colors.ink[900],
    paddingVertical: 14,
  },
  btns: { flexDirection: "row" },
});
